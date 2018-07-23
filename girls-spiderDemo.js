let http = require('http');
let iconv = require('iconv-lite');
let cheerio = require('cheerio');
let fs = require('fs');
let path = require('path');
//1，获取网页的HTML内容
http.get('http://www.27270.com/ent/meinvtupian/', (res) => {
    let arr = [];
    res.on('data', (chunk) => {
        //监听到所有数据存储到arr数组
        arr.push(chunk);
    });
    res.on('end', () => {
        //2，如果网页内容有乱码，进行乱码的处理(引用第三方的方法)
        let html = iconv.decode(Buffer.concat(arr), 'gbk');
        getHtmlData(html);
    });
});

//3，从html的dom结构中提取需要的数据，就是图片的src和标题
function getHtmlData(html) {
    //html的解析需要用到cheerio模块进行数据的提取
    let $ = cheerio.load(html);
    let array = $('div.MeinvTuPianBox>ul>li>a>i>img').toArray();
    let imgData = [];
    for (let i = 0; i < array.length; i++) {
        let obj = array[i];
        //console.log(obj);
        let src = $(obj).attr("src");
        let alt = $(obj).attr("alt");
        //console.log(`${alt} ${src}`);
        imgData.push({
            src, alt
        });
    }
    downLoadImg(imgData);
}

//4，下载图片
function downLoadImg(imgData) {
    imgData.forEach(imgObj => {
            //res本质是一个reader
        http.get(imgObj.src, (res) => {
            //拼接路径和文件名（注意文件名后面加后缀名）
            let imgPath = path.join('imgs', imgObj.alt + path.extname(imgObj.src));
            let writeStream = fs.createWriteStream(imgPath);
            res.pipe(writeStream);
        });
    });
}