const fs = require('fs');
const glob = require('fs').readdirSync;

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (!content.includes('alert(')) return;

  if (!content.includes('import toast')) {
    // Add import statement after the last import
    const importMatch = content.match(/import .* from .*;/g);
    if (importMatch) {
      const lastImport = importMatch[importMatch.length - 1];
      content = content.replace(lastImport, lastImport + '\nimport toast from "react-hot-toast";');
    } else {
      content = 'import toast from "react-hot-toast";\n' + content;
    }
  }

  // Replace success messages
  content = content.replace(/alert\((["'])(.*(?:[Ss]uccess|[Ss]uccessfully|updated to|set to).*)\1\)/g, 'toast.success($1$2$1)');
  // Replace success with backticks
  content = content.replace(/alert\(`(.*(?:[Ss]uccess|[Ss]uccessfully|updated to|set to).*)`\)/g, 'toast.success(`$1`)');
  
  // Replace error messages
  content = content.replace(/alert\((["'])(.*(?:[Ff]ail|[Ee]rror|[Cc]ancelled|Please|exceeds|Cannot|not found).*)\1\)/g, 'toast.error($1$2$1)');
  content = content.replace(/alert\(`(.*(?:[Ff]ail|[Ee]rror|[Cc]ancelled|Please|exceeds|Cannot|not found).*)`\)/g, 'toast.error(`$1`)');
  
  // Catch any dynamically concatenated ones that have error keywords
  content = content.replace(/alert\((["'].*[Ff]ailed.*["'] \+ .*)\)/g, 'toast.error($1)');
  content = content.replace(/alert\((["'].*[Ee]rror.*["'] \+ .*)\)/g, 'toast.error($1)');

  // Any remaining alerts just convert to toast.error (most remaining are error/warnings)
  content = content.replace(/alert\(/g, 'toast(');

  // Fix any accidental double toast(toast
  content = content.replace(/toast\.error\(toast\.error\(/g, 'toast.error(');
  content = content.replace(/toast\.success\(toast\.success\(/g, 'toast.success(');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated ' + filePath);
}

const files = [
  'src/app/profile/page.tsx',
  'src/app/cart/page.tsx',
  'src/app/product/[id]/page.tsx',
  'src/app/admin/users/[id]/page.tsx',
  'src/app/admin/products/create/page.tsx',
  'src/app/admin/page.tsx',
  'src/app/admin/products/[id]/edit/page.tsx',
  'src/app/admin/orders/create/page.tsx'
];

files.forEach(f => replaceInFile(f));
