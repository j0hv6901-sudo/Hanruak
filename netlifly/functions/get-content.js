const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
exports.handler = async (event) => {
  const { type, exam, subject } = event.queryStringParameters;
  let dir = '_jobs';
  if(type === 'syllabus') dir = '_syllabus';
  if(type === 'ca') dir = '_ca';
  const folder = path.join(__dirname, '../../', dir);
  if (!fs.existsSync(folder)) return { statusCode: 200, body: JSON.stringify(type==='syllabus'?{}:[]) };
  const files = fs.readdirSync(folder);
  if(type === 'syllabus') {
    const file = files.find(f => {
      const content = fs.readFileSync(path.join(folder, f), 'utf8');
      const { data } = matter(content);
      return data.exam === exam && data.subject === subject;
    });
    if (!file) return { statusCode: 200, body: JSON.stringify({}) };
    const content = fs.readFileSync(path.join(folder, file), 'utf8');
    const { data, content: body } = matter(content);
    return { statusCode: 200, headers: {"Content-Type": "application/json"}, body: JSON.stringify({...data, body}) };
  } else {
    const items = files.map(file => {
      const content = fs.readFileSync(path.join(folder, file), 'utf8');
      const { data, content: body } = matter(content);
      return {...data, body};
    }).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    return { statusCode: 200, headers: {"Content-Type": "application/json"}, body: JSON.stringify(items) };
  }
};
