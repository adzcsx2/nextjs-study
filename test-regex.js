// 测试正则表达式匹配
const testString = `          label= t("密码")
          name="password"`;

console.log('Original string:');
console.log(testString);

// 测试不同的正则表达式
const regex1 = /(\w+\s*=\s*)t\s*\(\s*"([^"\\]+)"\s*\)/g;
const regex2 = /(\w+\s*=)t\("([^"\\]+)"\)/g;

console.log('\nTesting regex1:', regex1);
const match1 = testString.replace(regex1, '$1{t("$2")}');
console.log('Result1:', match1);

console.log('\nTesting regex2:', regex2);  
const match2 = testString.replace(regex2, '$1{t("$2")}');
console.log('Result2:', match2);

// 更简单的测试
const regex3 = /(label\s*=\s*)t\("([^"]+)"\)/g;
console.log('\nTesting regex3:', regex3);
const match3 = testString.replace(regex3, '$1{t("$2")}');
console.log('Result3:', match3);