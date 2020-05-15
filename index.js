const visit = require('unist-util-visit')
const puppeteer = require('puppeteer')

const { defaultOption } = require('./shared/defaultOption')

const ErrorFormat = {
  title: defaultOption.error.title,
  description: defaultOption.error.description,
  favicon: defaultOption.favicon,
  url: defaultOption.error.url,
  ogImage: defaultOption.image,
}

const getHTML = pageData => {
  const { title, description, favicon, url, ogImage } = pageData
  const ogImageSrc = !ogImage || ogImage === 'undefined' ? defaultOption.image : ogImage
  const ogImageAlt =
    ogImage === 'undefined' ? 'default-image' : `${title}-image`
  const faviconSrc = !favicon || favicon === 'undefined' ? defaultOption.favicon : favicon

  return `
    <div>
      <a target="_blank" rel="noopener noreferrer" href="${url}" class="preview-notion-container">
        <div class="preview-notion-wrapper">
          <div class="preview-notion-title">${title}</div>
          <div class="preview-notion-description">${description}</div>
          <div class="preview-notion-url">
            <img class="preview-notion-favicon" src="${faviconSrc}" alt="${title}-favicon"/>
            <div class="preview-notion-link">${url}</div>
          </div>
        </div>
        <div class="preview-notion-image-wrapper">
          <img class="preview-notion-image" alt="${ogImageAlt}" src="${ogImageSrc}" />
        </div>
      </a>
    </div>
  `.trim()
}

const getPageData = async (browser, url) => {
  try {
    const page = await browser.newPage()

    await page.goto(url)

    //await page.waitForNavigation()
    //await page.waitForSelector('title')

    const [
      title,
      description,
      ogImage,
      favicon,
    ] = await Promise.all([
      page.$("meta[property='og:title']") ? 
        page.$eval("meta[property='og:title']", el => el.content) :
        page.title(),
      page.$("meta[property='og:description']") ? 
        page.$eval("meta[property='og:description']", el => el.content) :
        page.$("meta[name='description']", el => el.content),
      page.$("meta[property='og:image']") ? 
        page.$eval("meta[property='og:image']", el => el.content) :
        page.screenshot({path: 'img/screenShotPage.png'}) && 'img/screenShotPage.png',
      page.$$("link[rel~='icon']") && 
        page.$$eval("link[rel~='icon']", el => el[0].href) 
    ])
    /*
    const title = await page.$("meta[property='og:title']") ? 
      await page.$eval("meta[property='og:title']", el => el.content) :
      await page.title()
    const description = await page.$("meta[property='og:description']") ? 
      await page.$eval("meta[property='og:description']", el => el.content) :
      await page.$("meta[name='description']", el => el.content)
    const ogImage = await page.$("meta[property='og:image']") ? 
      await page.$eval("meta[property='og:image']", el => el.content) :
      (await page.screenshot({path: 'img/screenShotPage.png'})) && 'img/screenShotPage.png'
    const favicon = await page.$$("link[rel='icon']") && 
      await page.$$eval("link[rel='icon']", el => el[0].href)
    */
    return {
      title,
      description,
      url,
      ogImage,
      favicon,
    }
  } catch (e) {
    //console.log('LinkCardError: ' + e)
    return ErrorFormat
  }
}

const getUrlString = url => {
  const urlString = url.startsWith('http') ? url : `https://${url}`

  try {
    return new URL(urlString).toString()
  } catch (error) {
    return null
  }
}

const isValidCondition = (node, delimiter) => {
  if (node.type === 'link' && node.title === null && node.url) {
    return (
      node.children[0] &&
      node.children[0].type === 'text' &&
      node.children[0].value === delimiter
    )
  }
}

//module.exports = (pluginOption) => tree => {
module.exports = pluginOption => {
//module.exports = async ({ cache, markdownAST }, pluginOption) => {
  const options = { ...defaultOption, ...pluginOption }
  const { delimiter } = options

  return async tree => {
    const browser = await puppeteer.launch()
    const targets = []
    visit(tree, 'paragraph', paragraphNode => {
      //console.log(`found node`, paragraphNode.children[0].url);
      if (paragraphNode.children.length !== 1) {
        return
      }
  
      const [node] = paragraphNode.children
  
      if (!isValidCondition(node, delimiter)) {
        return
      }
  
      const { url, value = url } = node
      const urlString = getUrlString(value)
      //console.log(`urlString`, urlString);
  
      if (!urlString) {
        return
      }
  
      targets.push(async () => {
        let html
        //let html = await cache.get(urlString)
  
        //if (!html) {
        const data = await getPageData(browser, url)
        html = getHTML(data)
        //console.log(`data`, data);
          //await cache.set(urlString, html)
        //}
  
        node.type = `html`
        node.value = html
        node.children = undefined
      })
    })
  
    try {
      await Promise.all(targets.map(t => t()))
    } catch (e) {
      //console.log(`failed to get node for ${targets}\n`, er);
    } finally {
      await browser.close()
  
      //return markdownAST
    }
  }
}