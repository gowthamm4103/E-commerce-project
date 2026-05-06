const fs = require('fs');
const path = require('path');

function resolveConflicts(content) {
  let result = content;
  let iterations = 0;
  const maxIterations = 1000;
  
  while (result.includes('<<<<<<< HEAD') && iterations < maxIterations) {
    const startMarker = '<<<<<<< HEAD';
    const separator = '=======';
    const endPrefix = '>>>>>>> ';
    
    const startIdx = result.indexOf(startMarker);
    if (startIdx === -1) break;
    
    const sepIdx = result.indexOf(separator, startIdx);
    if (sepIdx === -1) break;
    
    const endIdx = result.indexOf('\n', sepIdx + separator.length);
    if (endIdx === -1) break;
    
    const afterEndMarker = result.indexOf('\n', endIdx);
    if (afterEndMarker === -1) break;
    
    // Extract the HEAD content (between <<<<<<< HEAD and =======)
    const headContent = result.substring(startIdx + startMarker.length, sepIdx);
    
    // Find the end of the >>>>>>> line
    const endLineEnd = result.indexOf('\n', afterEndMarker);
    const endOfConflict = endLineEnd === -1 ? result.length : endLineEnd;
    
    // Replace the entire conflict block with just the HEAD content
    result = result.substring(0, startIdx) + headContent + result.substring(endOfConflict);
    iterations++;
  }
  
  return result;
}

function processDir(dir) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && file !== 'node_modules') {
      processDir(filePath);
    } else if (file.match(/\.(tsx?|jsx?)$/)) {
      try {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('<<<<<<< HEAD')) {
          content = resolveConflicts(content);
          fs.writeFileSync(filePath, content);
          console.log('Fixed:', filePath);
        }
      } catch (err) {
        console.error('Error processing', filePath, err.message);
      }
    }
  });
}

console.log('Processing ./app directory...');
processDir('./app');
console.log('Processing ./server directory...');
processDir('./server');
console.log('Done!');