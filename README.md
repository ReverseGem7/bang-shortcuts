# Firefox Search Shortcuts Manager with Favicons and DuckDuckGo Bangs

This tool simplifies adding and managing Firefox Search Shortcuts by enabling:

- Importing DuckDuckGo Bangs as search shortcuts
- Adding custom search shortcuts easily
- Attaching optimized favicons to each shortcut

![Example](https://github.com/ReverseGem7/bang-shortcuts/blob/161c63167d766f77c6ce4fc87b4beddf18e1d76f/assets/example.png)

## Installation

Install dependencies using Bun:

```bash
bun install
```

## Usage

1. **Locate your Firefox profile directory**
   Open `about:profiles` in Firefox and copy the root directory path of the profile where you want to add custom search engines.

2. **Convert `search.json.mozlz4` to JSON**
   Extract and convert the `search.json.mozlz4` file from the profile to a plain JSON file (`search.json.mozlz4.json`).
   You can use tools such as [serj-kzv/mozlz4-edit](https://github.com/serj-kzv/mozlz4-edit) for this purpose.

3. **Place the converted JSON file**
   Copy `search.json.mozlz4.json` into the root directory of this project.

4. **Configure custom search engines**
   Modify `config.ts` to add, edit, or remove custom search engines as needed.

5. **Generate the output JSON**
   Run the following command to generate `output.json` with updated engines and favicons:

   ```bash
   bun run start
   ```

> [!IMPORTANT]  
> Close Firefox before replacing the file to avoid conflicts or file corruption.

6. **Replace the Firefox search engines file**
   Compress `output.json` back to `search.json.mozlz4` format and replace the original file in your Firefox profile directory.
