# Perkdown

Perkdown is a superset of Markdown with added support for conditional rendering and custom metadata.

## Conditional Rendering

Conditional rendering allows for easy multi-language support, or smaller changes depending on your needs.

## Backwards Compatibility

Perkdown aims to be backwards compatible with Markdown. Meaning that any Perkdown should render in a reasonable and human readable way. An example would be where Perkdown is used for multi-language support through conditionals. In this case a Markdown renderer would simply omit all Perkdown specific syntax and display all languages one after another.

It is strongly encouraged for Perkdown parsers to support all previous minor versions of the Perkdown protocol. So if a "1.0" version Perkdown file is loaded in a parser supporting "1.9" it should still render just the same.

## Sample Syntax

To keep reasonable backwards compatibility with Markdown, Perkdown uses HTML comments for all tags to simply dissapear when rendered by most Markdown renderers.

```md
<!-- USE:PRKMD=1.0 -->

<!-- BEGIN:LANG=en -->
<!-- META:TITLE="This is my awesome article" -->

# Awesome article

Hello world!

<!-- END:LANG=en-->


<!-- BEGIN:LANG=fi-->
<!-- META:TITLE="Mathava artikkeli" -->

Hei maailma!

<!-- END:LANG=fi-->
```

The `<!-- BEGIN:LANG=en -->` tag indicates that a new block is about to begin. This block is rendered when the `LANG` key is set to `en`. Everything between the `BEGIN` and `END` tags is conditionally evaluated. Meaning that even the `META` tags are conditional.
