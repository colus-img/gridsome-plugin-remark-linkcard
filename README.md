Gridsome Remark plugin to embed card about link.

This is a fork of [JaeYeopHan/gatsby-remark-link-card](https://github.com/JaeYeopHan/gatsby-remark-link-card) that is Gatsby plugin.

> You can preview the description of the link!

## Install

```sh
$ npm i colus-img/gridsome-plugin-remark-linkcard
```

## Usage

### in Markdown

```md
[$card](https://github.com/JaeYeopHan/gatsby-remark-link-card)
```

### with Config

Add in your `gridsome.config.js` like this:
```js
plugins: [
  {
    use: '@gridsome/vue-remark',
    options: {
      plugins: [
        [
          'gridsome-plugin-remark-linkcard', {
            // options
          }
        ]
      ],
    }
  }
]
```

## Options

| Property       | Type                                  | Default  | Description                                                |
| -------------- | ------------------------------------- | -------- | ---------------------------------------------------------- |
| `delimiter`       | `string`                              | `$card`      | Title of the link to create a card |
| `image`       | `string`                              | data-uri      | Default og image path |
| `favicon`       | `string`                              | data-uri      | Default favicon image path |
| `error`       | `Object`                              | -      | Default config when error |



## Inspiration
The credit for this plugin goes to JaeYeopHan. I only borrowed what they did for Gatsby. Thank you so much!

[JaeYeopHan/gatsby-remark-link-card： ⛳️ Gatsby Remark plugin to embed card about link. Just write markdown syntax with your delimeter and build! puppeter gather data!](https://github.com/JaeYeopHan/gatsby-remark-link-card)

### Original Author

👤 **JaeYeopHan (Jbee)**

- Github: [@JaeYeopHan](https://github.com/JaeYeopHan)
- Twitter: [@JbeeLjyhanll](https://twitter.com/JbeeLjyhanll)
