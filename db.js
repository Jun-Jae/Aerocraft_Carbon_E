import express from "express";
import mongoose from "mongoose";
import nunjucks from "nunjucks";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.urlencoded({ extended: false })); // express 기본 모듈 사용
app.use(bodyParser.json());

//nunjucks setting
app.set("view engine", "html"); //main.html -> main.(html)
//템플릿 엔진을 사용할 때 어떤 위치에서 파일을 찾을건지 경로 입력
nunjucks.configure("views", {
  //views 폴더가 nunjucks파일의 위치가 됨.
  autoescape: true,
  watch: true, //html파일이 수정될 경우, 다시 반영 후 렌더링
  express: app, //express자체가 어떤 객체를 나타내는지 앞서 선언한 app을 입력
});

//mongodb connect
mongoose
  .connect("mongodb://localhost:27017/carbon_emissions")
  .then(() => console.log("connected DB Successfully"))
  .catch((err) => console.log(err));

//mondodb setting
const { Schema } = mongoose;

const emission_factorSchema = new Schema({
  Model: String,
  tonCO2eq: Number,
});
const emission_factor = mongoose.model(
  "emission_factor",
  emission_factorSchema,
  "emission_factor"
);

const Gas_emission_yearSchema = new Schema({
  year: Number,
  tonCO2eq: Number,
});
const Gas_emission_year = mongoose.model(
  "Gas_emission_year",
  Gas_emission_yearSchema,
  "Greenhouse_Gas_Emissions_by_Year"
);

app.get("/", async (req, res) => {
  //print chart
  try {
    //find data
    let chartValue = await emission_factor.find({});
    //find the average
    let chartAvg = await emission_factor.aggregate([
      { $group: { _id: null, averageValue: { $avg: "$tonCO2eq" } } },
    ]);

    console.log(chartValue); // 결과를 확인하기 위해 로그로 출력
    console.log(chartAvg);

    // JSON 데이터를 문자열로 변환하여 Nunjucks에 전달
    res.render("main", {
      list: chartValue,
      data: JSON.stringify(chartValue),
      chartAvg: JSON.stringify(chartAvg),
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/year", async (req, res) => {
  //print chart
  try {
    let chartValue = await Gas_emission_year.find({});
    console.log(chartValue); // 결과를 확인하기 위해 로그로 출력
    // JSON 데이터를 문자열로 변환하여 Nunjucks에 전달
    const jsonString = JSON.stringify(chartValue);

    res.render("year", { list: chartValue, data: jsonString });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/sort", async (req, res) => {
  // chart sort
  let chartSort = await emission_factor.find({}).sort({ tonCO2eq: 1 });
  //find the average
  let chartAvg = await emission_factor.aggregate([
    { $group: { _id: null, averageValue: { $avg: "$tonCO2eq" } } },
  ]);
  console.log(chartSort);

  res.render("sort", {
    chartSort: chartSort,
    chartSortValue: JSON.stringify(chartSort),
    chartAvg: JSON.stringify(chartAvg),
  });
});

app.get("/reverseSort", async (req, res) => {
  // chart sort
  let chartReverseSort = await emission_factor.find({}).sort({ tonCO2eq: -1 });
  console.log(chartReverseSort);
  //find the average
  let chartAvg = await emission_factor.aggregate([
    { $group: { _id: null, averageValue: { $avg: "$tonCO2eq" } } },
  ]);
  console.log(chartReverseSort);

  res.render("reverseSort", {
    chartReverseSort: chartReverseSort,
    chartReverseSortValue: JSON.stringify(chartReverseSort),
    chartAvg: JSON.stringify(chartAvg),
  });
});

app.listen(3000, () => {
  console.log("Server is running");
});
