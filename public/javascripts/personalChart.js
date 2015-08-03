function displayLineChart(record) {

    console.log(record);

    var graph = {
        labels: [],
        datasets: [
          {
                label: "最近の得点傾向",
                fillColor: "rgba(220,220,220,0.2)",
                strokeColor: "rgba(220,220,220,1)",
                pointColor: "rgba(220,220,220,1)",
                pointStrokeColor: "#fff",
                pointHighlightFill: "#fff",
                pointHighlightStroke: "rgba(220,220,220,1)",
                data: [],
            }
        ]
    };

    console.log(record.length);
    for (var i = 0; i < record.length; i++) {
      graph.datasets[0].data[i] = record[i].sum;
      graph.labels[i] =  record[i].created;
    }

    console.log(graph);

    var ctx = document.getElementById("lineChart").getContext("2d");
    var options = { };
    var lineChart = new Chart(ctx).Line(graph, options);
}
