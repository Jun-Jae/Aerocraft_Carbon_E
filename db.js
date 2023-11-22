import express from 'express';
import nunjucks from 'nunjucks';
import mongoose from 'mongoose';
import path from 'path';

const app = express(); //express 객체 생성
app.set('view engine', 'html'); //main.html -> main.(html)

//nunjucks setting
//템플릿 엔진을 사용할 때 어떤 위치에서 파일을 찾을건지 경로 입력
nunjucks.configure('views', {

  watch : true, //html파일이 수정될 경우, 다시 반영 후 렌더링
  express : app //express자체가 어떤 객체를 나타내는지 앞서 선언한 app을 입력
})

//mongodb connect
mongoose
  .connect('mongodb://localhost:27017/carbon_emissions')
  .then(() => console.log('connected DB Successfully'))
  .catch((err) => console.log(err));

//mondodb setting
const { Schema } = mongoose; // 스키마 정의
const distanceSchema = new Schema({ 
  mile: Number
})

const distance = mongoose.model('distance', distanceSchema, 'distance');

const emission_factorSchema = new Schema({
  co2 : Number,
  km : Number,
  passenger : Number
})
const emission_factor = mongoose.model('emission_factor', emission_factorSchema, 'emissions_factor');

app.get('/', async (req, res) => {
  try {
    let chartValue = await distance.find({});
    console.log(chartValue); // 결과를 확인하기 위해 로그로 출력
    // JSON 데이터를 문자열로 변환하여 Nunjucks에 전달
    const jsonString = JSON.stringify(chartValue);
    res.render('main', { data : jsonString }); // main 인지 index 인지 확인
} catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
}
});

// middleware
app.listen(3000, () => {
  console.log('Server is running');
})