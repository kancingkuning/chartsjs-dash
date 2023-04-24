var dt = $.csv.toObjects('agegroup.csv');
console.log('data', dt);

//female datapoint converter
const female = [18, 12, 6, 9, 12, 3, 9, 12, 3, 4, 2];
const femaleData = [];
female.forEach(element => femaleData.push(element * -1));
console.log('coba', femaleData);

const tooltip = {
    yAlign: 'bottom',
    titleAlign: 'center',
    mode: 'index',                             
    callbacks: {
        label: function(context) {
            // console.log(context.raw);
            // console.log(context.dataset.label);
            return `${(context.dataset.label)} ${Math.abs(context.raw)}`;
        }
    }                                                                                                                                             
  };   

const data = {
    labels: ['>70 year old', '55-69 year old', '45-54 year old', '20-44 year old', '15-19 year old', '10-14 year old', '5-9 year old', '1-4 year old', '28 day old - 1 year old', '8-28 day old', '0-7 day old'],
    datasets: [{
      label: 'Male',
      data: [18, 12, 6, 9, 12, 3, 9, 12, 2, 3, 11],
      backgroundColor: 'rgba(54, 162, 235, 0.2)',
      borderColor: 'rgba(54, 162, 235, 1)',
      borderWidth: 1
    },
    {
        label: 'Female',
        data: femaleData,
        backgroundColor: 'rgba(255, 26, 104, 0.2)',
        borderColor: 'rgba(255, 26, 104, 1)',
        borderWidth: 1
      }]
  };

                         
  // config                                                                                 
  const config = {                                                         
    type: 'bar',
    data,
    options: {
        indexAxis: 'y',
      scales: {
        x: {
            stacked: true,
            ticks: {
                callback: function(value, index, values) {
                    // console.log(Math.abs(value));
                    return Math.abs(value);
                }
            }           
        },
        y: {
          beginAtZero: true,
          stacked: true
        }
      },
      plugins: {
        tooltip,
      }
    }
  };

  // render init block
  const but_chart = new Chart(
    document.getElementById('but_chart'),
    config
  );

  // Instantly assign Chart.js version
  const chartVersion = document.getElementById('but_chart');
//   chartVersion.innerText = Chart.version;