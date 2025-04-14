# Extension-LaTeX

Render math formulas in LaTeX/AsciiMath format in SillyTavern chats.

## How to use

1. Install the "LaTeX" extension from the "Download Extensions & Assets" menu in the Extensions panel.
2. Use the `latex` or `asciimath` code block to render math formulas in LaTeX or AsciiMath format respectively.
3. To use the legacy syntax with `$$` (LaTeX) and `$` (AsciiMath) delimiters in Markdown, import the following scripts with the Regex extension.

* [$$ - LaTeX](./assets/$$_-_latex.json)
* [$ - AsciiMath](./assets/$_-_asciimath.json)

### Example

<pre><code>```latex
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
```</code></pre>

<pre><code>```asciimath
int_{-oo}^{oo} e^{-x^2} dx = sqrt{pi}
```</code></pre>

## License

AGPL-3.0
