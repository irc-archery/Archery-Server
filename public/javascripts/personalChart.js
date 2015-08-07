var Record = [];

function displayLineChart() {

    var record = Record;
    
    var graph = {
        labels: [],
        datasets: [
          {
                label: "最近の得点傾向",
                fillColor: "rgba(171,218,252,0.3)",
                strokeColor: "rgba(171,218,252,1)",
                pointColor: "rgba(171,218,252,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: [],
            }
        ]
    };

    for (var i = 0; i < record.length; i++) {
      graph.datasets[0].data[i] = (record[record.length - i - 1].sum != 0 ? record[record.length - i - 1].sum / record[record.length - i - 1].perEnd / record[record.length - i - 1].arrows : 0).toFixed(1);
      graph.labels[i] = record[record.length - i - 1].created;
    }

    var ctx = document.getElementById("lineChart").getContext("2d");
    
    var options = {
        // X軸 , Y軸の色
        scaleLineColor : "rgba(109,214,218,1)",
        // グリッド線の色
        scaleGridLineColor : "rgba(102,102,102,0.2)",
        // グラフ目盛の文字サイズ
        scaleFontSize : 14,
        // 丸点の大きさ
        pointDotRadius : 5,
        // グラフ線を曲線にするか
        bezierCurve : false,
     };
    var lineChart = new Chart(ctx).Line(graph, options);
}
