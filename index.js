/// interactive menubar
let toggle=document.querySelector('.toggle');
let navigation=document.querySelector('.navigation');
let main=document.querySelector('.main');

toggle.onclick=function(){
    navigation.classList.toggle('active');
    main.classList.toggle('active');
}


// add hovered class in selected list item
let list = document.querySelectorAll('.navigation li');
function activeLink(){
    list.forEach((item) =>
    item.classList.remove('hovered'));
    this.classList.add('hovered');
}
list.forEach((item) =>
item.addEventListener('mouseover', activeLink));

// load data //
let file_path = 'https://raw.githubusercontent.com/jokoeliyanto/web-dashboard-from-scratch/main/data_all_agg_pkm.csv';
let warna_p = 'https://raw.githubusercontent.com/jokoeliyanto/web-dashboard-from-scratch/main/warna_penyakit.csv';

var color_p = await aq.loadCSV(warna_p);
var dt = await aq.loadCSV(file_path);

console.log('Initial Data')
dt.print()

// filter box //

const prov_filter   = document.getElementById("prov_filter");
const kab_filter    = document.getElementById("kab_filter");
const kec_filter    = document.getElementById("kec_filter");
// const fks_filter    = document.getElementById("fks_filter");
const start_date    = document.getElementById("start_date");
const end_date      = document.getElementById("end_date");

var  dt_prov =  dt
                .filter(aq.escape(d =>  d.provinsi      === 'BALI'));
var  dt_kab  =  dt
                .filter(aq.escape(d =>  d.provinsi      === 'BALI'))
                .filter(aq.escape(d =>  d.kabupaten     === 'KAB. BADUNG'));
var  dt_kec  =  dt
                .filter(aq.escape(d =>  d.provinsi      === 'BALI'))
                .filter(aq.escape(d =>  d.kabupaten     === 'KAB. BADUNG'))
                .filter(aq.escape(d =>  d.kecamatan     === 'ABIANSEMAL'));

console.log("CHILDREn", kab_filter)

const filter_prov_ar = [... new Set(dt.array('provinsi').sort())];
const filter_kab_ar  = [... new Set(dt.array('kabupaten').sort())];
const filter_kec_ar  = [... new Set(dt.array('kecamatan').sort())];
// const filter_fks_ar  = [... new Set(dt.array('fasyankes').sort())];

filter_prov_ar.forEach(function (item){
    let o = document.createElement("option");
    o.text = item;
    o.value = item;
prov_filter.appendChild(o);
});

filter_kab_ar.forEach(function (item){
    let o = document.createElement("option");
    o.text = item;
    o.value = item;
kab_filter.appendChild(o);
});

filter_kec_ar.forEach(function (item){
    let o = document.createElement("option");
    o.text = item;
    o.value = item;
kec_filter.appendChild(o);
});

/// card box //

var prov_select = prov_filter.value;
var kab_select  = kab_filter.value;
var kec_select  = kec_filter.value;
// var fks_select  = fks_filter.value;
var start_date_select  = start_date.value;
var end_date_select  = end_date.value;

let start_date_filter = new Date(start_date_select)
let end_date_filter = new Date(end_date_select)

// All Visit
// Semua kunjungan pasien untuk semua penyakit
console.log("Mulai")

console.log("Start Date", start_date_select)
console.log("End Date", end_date_select)
console.log("Start Date 2", start_date_filter)
console.log("End Date 2", end_date_filter)

console.log("Provinsi", prov_select)
console.log("Kabupaten", kab_select)
console.log("Kecamatan", kec_select)
// console.log("Fasyankes", fks_select)

let dt_filter = dt
                .filter(aq.escape(d =>  d.tanggal >= start_date_filter && d.tanggal <= end_date_filter))
                .filter(aq.escape(d =>  d.provinsi      === prov_select))
                .filter(aq.escape(d =>  d.kabupaten     === kab_select))
                .filter(aq.escape(d =>  d.kecamatan     === kec_select))
                // .filter(aq.escape(d =>  d.fasyankes     === fks_select))

console.log("Filtered Data")
console.log(dt_filter.print())

let visit = dt_filter
            .rollup({all_visit: d => op.sum(d.kasus)})
            .get('all_visit', 0)

console.log("Jumlah Kunjungan")
console.log(visit)

// Cumulative Case 
// Kunjungan pasien dengan penyakit SKDR

console.log("Cumulative Case")

let cum_case =  dt_filter
                .filter(d => d.penyakit !== 'None')
                .rollup({all_visit: d => op.sum(d.kasus)})
                .get('all_visit',0)

console.log(cum_case)

// Week
// Minggu min dan max data

console.log("Week")

let week =  dt_filter
            .rollup({max_week: d => op.max(d.minggu)})
            .get('max_week',0)
console.log(week)

var cum_case_dsp = document.getElementById("cum_case");
var visit_dsp = document.getElementById("tot_vis");
var week_dsp = document.getElementById("week");

cum_case_dsp.innerHTML = cum_case;
visit_dsp.innerHTML = visit;
week_dsp.innerHTML = week;

/// charts

/// case dist by fsy barchart
let data_1 = dt_filter
            .filter(d => d.penyakit !== 'None')
            .groupby('fasyankes')
            .rollup({jumlah_kasus: d => op.sum(d.kasus)})
            .orderby(aq.desc('jumlah_kasus'));

console.log(data_1.array('fasyankes'));
console.log(data_1.array('jumlah_kasus'));

// Setup Block
const cbf_data = {
    labels: data_1.array('fasyankes'),
    datasets: [{
        label: 'Kasus',
        data: data_1.array('jumlah_kasus'),
        borderWidth: 1,

    }]
};


var ctx = document.getElementById('bar_cbf').getContext('2d');
var bar_cbf = new Chart(ctx, {
    type: 'bar',
    data: cbf_data,
    options: {
        aspectRatio: 2,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Fasyankes'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Kasus'
                }
            }
        },
        indexAxis: 'y',
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                position: 'top',
                align: 'center',
                text: 'Cases Distribution by Fasyankes',
                padding: 20,
                font: {size: 18}
            }
        },
        legend: {
            display: false
        }
    }
});


/// common disease barchart
let data_2 = dt_filter
            .filter(d => d.penyakit === 'Diare Akut' ||
            d.penyakit === 'Malaria Konfirmasi' ||
            d.penyakit === 'ILI (Penyakit Serupa Influenza)' || 
            d.penyakit === 'Suspek COVID-19' ||
            d.penyakit === 'Suspek Dengue' || 
            d.penyakit === 'Pnemonia' || 
            d.penyakit === 'Diare Berdarah/ Disentri' || 
            d.penyakit === 'Suspek Demam Tifoid' || 
            d.penyakit === 'Sindrom Jaundice Akut' || 
            d.penyakit === 'Suspek Chikungunya' ||
            d.penyakit === 'Suspek Meningitis/Encephalitis')
            .groupby('penyakit')
            .rollup({jumlah_kasus: d => op.sum(d.kasus)})
            .join(color_p, ['penyakit', 'penyakit'])
            .orderby(aq.desc('jumlah_kasus'));

console.log("Group By")
console.log(data_2.print());

const cdd_data = {
    labels: data_2.array('penyakit'),
    datasets: [{
        label: 'Kasus',
        data: data_2.array('jumlah_kasus'),
        backgroundColor:  data_2.array('color'),
        borderColor:  data_2.array('color'),
        borderWidth: 1,
        
    }]
};

var ctx = document.getElementById('bar_cdd').getContext('2d');
var bar_cdd = new Chart(ctx, {
    type: 'bar',
    data: cdd_data,
    options: {
        aspectRatio: 2,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Penyakit'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Kasus'
                }
            }
        },
        indexAxis: 'y',
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                position: 'top',
                align: 'center',
                text: 'Cases Distribution of Common Disease',
                padding: 20,
                font: {size: 18}
            }
        },
    }
});

/// cases trend common dis linechart
let data_3 = dt_filter
            .filter(d => d.penyakit === 'Diare Akut' ||
            d.penyakit === 'Malaria Konfirmasi' ||
            d.penyakit === 'ILI (Penyakit Serupa Influenza)' || 
            d.penyakit === 'Suspek COVID-19' ||
            d.penyakit === 'Suspek Dengue' || 
            d.penyakit === 'Pnemonia' || 
            d.penyakit === 'Diare Berdarah/ Disentri' || 
            d.penyakit === 'Suspek Demam Tifoid' || 
            d.penyakit === 'Sindrom Jaundice Akut' || 
            d.penyakit === 'Suspek Chikungunya' ||
            d.penyakit === 'Suspek Meningitis/Encephalitis')
            .filter(d => d.minggu === 49 || d.minggu === 50)
            .groupby('tahun_minggu','penyakit')
            .rollup({jumlah_kasus: d => op.sum(d.kasus)})
            .orderby('tahun_minggu')

console.log(data_3.print())

const cdt_data = {
    labels: [... new Set(data_3.array('tahun_minggu'))],
    datasets: [
        {
            label: 'Diare Akut',
            data: data_3.filter(d => d.penyakit === 'Diare Akut').array('jumlah_kasus'),
            backgroundColor:'#9ebcda',
            borderColor:'#9ebcda'},
        {
            label: 'Malaria Konfirmasi',
            data: data_3.filter(d => d.penyakit === 'Malaria Konfirmasi').array('jumlah_kasus'),
            backgroundColor:'#fdbb84',
            borderColor:'#fdbb84'},
        {
            label: 'ILI (Penyakit Serupa Influenza)',
            data: data_3.filter(d => d.penyakit === 'ILI (Penyakit Serupa Influenza)').array('jumlah_kasus'),
            backgroundColor:'#a8ddb5',
            borderColor:'#a8ddb5'},
        {
            label: 'Suspek COVID-19',
            data: data_3.filter(d => d.penyakit === 'Suspek COVID-19').array('jumlah_kasus'),
            backgroundColor:'#2b8cbe',
            borderColor:'#2b8cbe'},
        {
            label: 'Pnemonia',
            data: data_3.filter(d => d.penyakit === 'Pnemonia').array('jumlah_kasus'),
            backgroundColor:'#a6bddb',
            borderColor:'#a6bddb'},
        {
            label: 'Diare Berdarah/ Disentri',
            data: data_3.filter(d => d.penyakit === 'Diare Berdarah/ Disentri').array('jumlah_kasus'),
            backgroundColor:'#8856a7',
            borderColor:'#8856a7'},
        {
            label: 'Suspek Demam Tifoid',
            data: data_3.filter(d => d.penyakit === 'Suspek Demam Tifoid').array('jumlah_kasus'),
            backgroundColor:'#c994c7',
            borderColor:'#c994c7'},
        {
            label: 'Sindrom Jaundice Akut',
            data: data_3.filter(d => d.penyakit === 'Sindrom Jaundice Akut').array('jumlah_kasus'),
            backgroundColor:'#ece2f0',
            borderColor:'#ece2f0'},
        {
            label: 'Suspek Chikungunya',
            data: data_3.filter(d => d.penyakit === 'Suspek Chikungunya').array('jumlah_kasus'),
            backgroundColor:'#c51b8a',
            borderColor:'#c51b8a'},
        {
            label: 'Suspek Meningitis/Encephalitis',
            data: data_3.filter(d => d.penyakit === 'Suspek Meningitis/Encephalitis').array('jumlah_kasus'),
            backgroundColor:'#7fcdbb',
            borderColor:'#7fcdbb'}
    ]
}

const cty = document.getElementById("line_cdt");
console.log(cty);
let line_cdt = new Chart(cty, {
    type: 'line',
    data: cdt_data,
    options: {
        aspectRatio: 2,
        resposive: true,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Kasus'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Tahun-Minggu'
                }
            }
        },
        plugins: {
            legend: {
                display: false,
                // position: 'right'
            },
            title: {
                display: true,
                position: 'top',
                align: 'center',
                text: 'Cases Trend of Common Disease',
                padding: 20,
                font: {size: 18}
            }
        }
    }
});

/// case dist of rare dis barchart
let data_4 = dt_filter
            .filter(d => d.penyakit === 'Suspek HFMD' ||
            d.penyakit === 'Suspek Tetanus' ||
            d.penyakit === 'Gigitan Hewan Penular Rabies' || 
            d.penyakit === 'Suspek Campak' ||
            d.penyakit === 'Suspek Kolera' || 
            d.penyakit === 'Acute Flacid Paralysis (AFP)' || 
            d.penyakit === 'Pertussis' || 
            d.penyakit === 'Suspek Leptospirosis' || 
            d.penyakit === 'Sindrom Jaundice Akut' || 
            d.penyakit === 'Kluster Penyakit yang tidak lazim' ||
            d.penyakit === 'Suspek Tetanus Neonatorum' ||
            d.penyakit === 'Suspek Difteri')
            .groupby('penyakit')
            .rollup({jumlah_kasus: d => op.sum(d.kasus)})
            .join(color_p, ['penyakit', 'penyakit'])
            .orderby(aq.desc('jumlah_kasus'));

console.log("Group By")
console.log(data_4.print());

// Setup Block
const rdd_data = {
    labels: data_4.array('penyakit'),
    datasets: [{
        label: 'Kasus',
        data: data_4.array('jumlah_kasus'),
        backgroundColor:  data_4.array('color'),
        borderColor:  data_4.array('color'),
        borderWidth: 1,
        
    }]
};

var ctz = document.getElementById('bar_rdd').getContext('2d');
var bar_rdd = new Chart(ctz, {
    type: 'bar',
    data: rdd_data,
    options: {
        aspectRatio: 2,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Penyakit'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Kasus'
                }
            }
        },
        indexAxis: 'y',
        plugins: {
            legend: {
                display: false
            },
            title: {
                display: true,
                position: 'top',
                align: 'center',
                text: 'Cases Distribution of Rare Disease',
                padding: 20,
                font: {size: 18}
            }
        },
    }
});

/// case trend rare dis linechart
let data_5 = dt_filter
            .filter(d => d.penyakit === 'Suspek HFMD' ||
            d.penyakit === 'Suspek Tetanus' ||
            d.penyakit === 'Gigitan Hewan Penular Rabies' || 
            d.penyakit === 'Suspek Campak' ||
            d.penyakit === 'Suspek Kolera' || 
            d.penyakit === 'Acute Flacid Paralysis (AFP)' || 
            d.penyakit === 'Pertussis' || 
            d.penyakit === 'Suspek Leptospirosis' || 
            d.penyakit === 'Sindrom Jaundice Akut' || 
            d.penyakit === 'Kluster Penyakit yang tidak lazim' ||
            d.penyakit === 'Suspek Tetanus Neonatorum' ||
            d.penyakit === 'Suspek Difteri')
            .groupby('tahun_minggu','penyakit')
            .rollup({jumlah_kasus: d => op.sum(d.kasus)})
            .orderby('tahun_minggu');

console.log(data_5.print())

// Setup Block
const rdt_data = {
    labels: [... new Set(data_5.array('tahun_minggu'))],
    datasets: [
        {
            label: 'Suspek HFMD',
            data: data_5.filter(d => d.penyakit === 'Suspek HFMD').array('jumlah_kasus'),
            backgroundColor:'#f7fcb9',
            borderColor:'#f7fcb9'},
        {
            label: 'Suspek Tetanus',
            data: data_5.filter(d => d.penyakit === 'Suspek Tetanus').array('jumlah_kasus'),
            backgroundColor:'#2ca25f',
            borderColor:'#2ca25f'},
        {
            label: 'Gigitan Hewan Penular Rabies',
            data: data_5.filter(d => d.penyakit === 'Gigitan Hewan Penular Rabies').array('jumlah_kasus'),
            backgroundColor:'#43a2ca',
            borderColor:'#43a2ca'},
        {
            label: 'Suspek Campak',
            data: data_5.filter(d => d.penyakit === 'Suspek Campak').array('jumlah_kasus'),
            backgroundColor:'#e34a33',
            borderColor:'#e34a33'},  
        {
            label: 'Suspek Kolera',
            data: data_5.filter(d => d.penyakit === 'Suspek Kolera').array('jumlah_kasus'),
            backgroundColor:'#1c9099',
            borderColor:'#1c9099'},
        {
            label: 'Acute Flacid Paralysis (AFP)',
            data: data_5.filter(d => d.penyakit === 'Acute Flacid Paralysis (AFP)').array('jumlah_kasus'),
            backgroundColor:'#d95f0e',
            borderColor:'#d95f0e'},
        {
            label: 'Pertussis',
            data: data_5.filter(d => d.penyakit === 'Pertussis').array('jumlah_kasus'),
            backgroundColor:'#dd1c77',
            borderColor:'#dd1c77'},
        {
            label: 'Suspek Leptospirosis',
            data: data_5.filter(d => d.penyakit === 'Suspek Leptospirosis').array('jumlah_kasus'),
            backgroundColor:'#756bb1',
            borderColor:'#756bb1'},
        {
            label: 'Kluster Penyakit yang tidak lazim',
            data: data_5.filter(d => d.penyakit === 'Kluster Penyakit yang tidak lazim').array('jumlah_kasus'),
            backgroundColor:'#bdbdbd',
            borderColor:'#bdbdbd'},
        {
            label: 'Suspek Tetanus Neonatorum',
            data: data_5.filter(d => d.penyakit === 'Suspek Tetanus Neonatorum').array('jumlah_kasus'),
            backgroundColor:'#e5f5e0',
            borderColor:'#e5f5e0'},
        {
            label: 'Suspek Difteri',
            data: data_5.filter(d => d.penyakit === 'Suspek Difteri').array('jumlah_kasus'),
            backgroundColor:'#fde0dd',
            borderColor:'#fde0dd'}          
    ]
}

const cta = document.getElementById("line_rdt");
console.log(cta);
let line_rdt = new Chart(cta, {
    type: 'line',
    data: rdt_data,
    options: {
        aspectRatio: 2,
        resposive: true,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Kasus'
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Tahun-Minggu'
                }
            }
        },
        plugins: {
            legend: {
                display: false,
                // position: 'right'
            },
            title: {
                display: true,
                position: 'top',
                align: 'center',
                text: 'Cases Trend of Rare Disease',
                padding: 20,
                font: {size: 18}
            }
        }
    }
});    

/// fsy x dis heatmap
// let data_6 = dt_filter
//             .filter(d => d.penyakit == 'ILI (Penyakit Serupa Influenza')
//             .groupby('fasyankes')
//             .rollup({jumlah_kasus: d => op.sum(d.kasus)})
//             .orderby('tanggal');

// console.log("Group By")
// console.log(data_6.print());

// const hm_data = {
//     labels: [... new Set(data_6.array('tanggal'))],
//     datasets: [
//         {
//             label: 'ILI (Penyakit Serupa Influenza)',
//             data: data_6.filter(d => d.penyakit === 'ILI (Penyakit Serupa Influenza').array('jumlah_kasus')
//         }
//     ]
// }

// const ctb = document.getElementById("hm_disweek");
// console.log(ctb);
// let hm_disweek = new Chart(ctb, {
//     type: 'matrix',
//     data: hm_data,
//     options: {
//         plugins: {
//             legend: true,
//             tooltip: {
//                 callbacks: {
//                     title() {
//                         return '';
//                     },
//                     label(context) {
//                         const v = context.dataset.data[context.dataIndex];
//                         return ['Tanggal: ' + d.tanggal, 'Fasyankes: ' + d.fasyankes, 'Kasus: ' + d.jumlah_kasus];
//                     }
//                 }
//             }
//         },
//         scales: {
//             y: {
//                 beginAtZero: true,
//                 title: {
//                     display: true,
//                     text: 'Tanggal'
//                 }
//             },
//             x: {
//                 title: {
//                     display: true,
//                     text: 'Fasyankes'
//                 }
//             },
//             indexAxis: y,
//             plugins: {
//                 title: {
//                     display: true,
//                     position: 'top',
//                     align: 'center',
//                     text: 'Heatmap Fasyankes x Disease',
//                     font: {
//                         size: 18
//                     }
//                 }
//             }
//         }
//     }
// });

///

prov_filter.addEventListener('change', filterData);
kab_filter.addEventListener('change', filterData);
kec_filter.addEventListener('change', filterData2);
// fks_filter.addEventListener('change', filterData);
start_date.addEventListener('change', filterData);
end_date.addEventListener('change', filterData);

function updateFilterDropdown(){
    
}

// Filter Data Function
function filterData() {
    var prov_filter   = document.getElementById("prov_filter");
    var kab_filter    = document.getElementById("kab_filter");
    var kec_filter    = document.getElementById("kec_filter");

    var prov_select = prov_filter.value;
    var kab_select  = kab_filter.value;
    var kec_select  = kec_filter.value;
    // var fks_select  = fks_filter.value;
    var start_date_select  = start_date.value;
    var end_date_select  = end_date.value;

    let start_date_filter = new Date(start_date_select)
    let end_date_filter = new Date(end_date_select)

    var  dt_prov =  dt
                .filter(aq.escape(d =>  d.provinsi      === prov_select));
    var  dt_kab  =  dt
                    .filter(aq.escape(d =>  d.provinsi      === prov_select))
                    .filter(aq.escape(d =>  d.kabupaten     === kab_select));

    var filter_prov_ar2 = [... new Set(dt.array('provinsi').sort())];
    var filter_kab_ar2  = [... new Set(dt_prov.array('kabupaten').sort())];
    var filter_kec_ar2  = [... new Set(dt_kab.array('kecamatan').sort())];

    var options = document.querySelectorAll('#prov_filter option')
    options.forEach(o => o.remove());
    
    filter_prov_ar2.forEach(function (item){
        let o = document.createElement("option");
        o.text = item;
        o.value = item;
    prov_filter.appendChild(o);
    prov_filter.value = prov_select;
    });

    console.log("Array Baru", filter_kab_ar2)
    var options = document.querySelectorAll('#kab_filter option')
        options.forEach(o => o.remove());
    
    filter_kab_ar2.forEach(function (item){
        let o = document.createElement("option");
        o.text = item;
        o.value = item;
    kab_filter.appendChild(o);
    kab_filter.value = kab_select;
    });

    var options = document.querySelectorAll('#kec_filter option')
    options.forEach(o => o.remove());
    filter_kec_ar2.forEach(function (item){
        let o = document.createElement("option");
        o.text = item;
        o.value = item;
    kec_filter.appendChild(o);
    });    
    var prov_filter   = document.getElementById("prov_filter");
    var kab_filter    = document.getElementById("kab_filter");
    var kec_filter    = document.getElementById("kec_filter");

    var prov_select = prov_filter.value;
    var kab_select  = kab_filter.value;
    var kec_select  = kec_filter.value;
    var start_date_select  = start_date.value;
    var end_date_select  = end_date.value;

    var  dt_prov =  dt
                .filter(aq.escape(d =>  d.provinsi      === prov_select));
    var  dt_kab  =  dt
                    .filter(aq.escape(d =>  d.provinsi      === prov_select))
                    .filter(aq.escape(d =>  d.kabupaten     === kab_select));

    var filter_prov_ar2 = [... new Set(dt.array('provinsi').sort())];
    var filter_kab_ar2  = [... new Set(dt_prov.array('kabupaten').sort())];
    var filter_kec_ar2  = [... new Set(dt_kab.array('kecamatan').sort())];

    var options = document.querySelectorAll('#prov_filter option')
    options.forEach(o => o.remove());
    
    filter_prov_ar2.forEach(function (item){
        let o = document.createElement("option");
        o.text = item;
        o.value = item;
    prov_filter.appendChild(o);
    prov_filter.value = prov_select;
    });

    console.log("Array Baru", filter_kab_ar2)
    var options = document.querySelectorAll('#kab_filter option')
        options.forEach(o => o.remove());
    
    filter_kab_ar2.forEach(function (item){
        let o = document.createElement("option");
        o.text = item;
        o.value = item;
    kab_filter.appendChild(o);
    kab_filter.value = kab_select;
    });

    var options = document.querySelectorAll('#kec_filter option')
    options.forEach(o => o.remove());
    filter_kec_ar2.forEach(function (item){
        let o = document.createElement("option");
        o.text = item;
        o.value = item;
    kec_filter.appendChild(o);
    });

    var prov_filter   = document.getElementById("prov_filter");
    var kab_filter    = document.getElementById("kab_filter");
    var kec_filter    = document.getElementById("kec_filter");

    var prov_select2 = prov_filter.value;
    var kab_select2  = kab_filter.value;
    var kec_select2  = kec_filter.value;

    console.log('Sebelum', prov_select)
    console.log('Sesudah', prov_select2)
    console.log('Sebelum', kab_select)
    console.log('Sesudah', kab_select2)
    console.log('Sebelum', kec_select)
    console.log('Sesudah', kec_select2)

    let dt_fltr2 = dt
                .filter(aq.escape(d =>  d.tanggal >= start_date_filter && d.tanggal <= end_date_filter))
                .filter(aq.escape(d =>  d.provinsi      === prov_select))
                .filter(aq.escape(d =>  d.kabupaten     === kab_select))
                .filter(aq.escape(d =>  d.kecamatan     === kec_select))
                // .filter(aq.escape(d =>  d.fasyankes     === fks_select))
    console.log(dt_fltr2.print());
    
    console.log("Filtered Data")
    console.log(dt_fltr2.print())
    
    let visit = dt_fltr2
                .rollup({all_visit: d => op.sum(d.kasus)})
                .get('all_visit',0)
    
    console.log("Jumlah Kunjungan")
    console.log(visit)

    console.log("Cumulative Case")
    
    let cum_case =  dt_fltr2
                    .filter(d => d.penyakit !== 'None')
                    .rollup({all_visit: d => op.sum(d.kasus)})
                    .get('all_visit', 0)
    
    console.log(cum_case)
    
    console.log("Week")
    
    let week =  dt_fltr2
                .rollup({max_week: d => op.max(d.minggu)})
                .get('max_week', 0)
    console.log(week)
    
    var cum_case_dsp = document.getElementById("cum_case");
    var visit_dsp = document.getElementById("tot_vis");
    var week_dsp = document.getElementById("week");

    cum_case_dsp.innerHTML = cum_case;
    visit_dsp.innerHTML = visit;
    week_dsp.innerHTML = week;

    
    let data_1_2 = dt_fltr2
            .filter(d => d.penyakit !== 'None')
            .groupby('fasyankes')
            .rollup({jumlah_kasus: d => op.sum(d.kasus)})
            .orderby(aq.desc('jumlah_kasus'));
    
    console.log(data_1_2)
    const cbf_data2 = {
                labels: data_1_2.array('fasyankes'),
                datasets: [{
                    label: 'Kasus',
                    data: data_1_2.array('jumlah_kasus'),
                    borderWidth: 1,
                    
                }]
            };
    bar_cbf.config.data = cbf_data2
    bar_cbf.update()

    let data_2_2 = dt_fltr2
            .filter(d => d.penyakit === 'Diare Akut' ||
            d.penyakit === 'Malaria Konfirmasi' ||
            d.penyakit === 'ILI (Penyakit Serupa Influenza)' || 
            d.penyakit === 'Suspek COVID-19' ||
            d.penyakit === 'Suspek Dengue' || 
            d.penyakit === 'Pnemonia' || 
            d.penyakit === 'Diare Berdarah/ Disentri' || 
            d.penyakit === 'Suspek Demam Tifoid' || 
            d.penyakit === 'Sindrom Jaundice Akut' || 
            d.penyakit === 'Suspek Chikungunya' ||
            d.penyakit === 'Suspek Meningitis/Encephalitis')
            .groupby('penyakit')
            .rollup({jumlah_kasus: d => op.sum(d.kasus)})
            .join(color_p, ['penyakit', 'penyakit'])
            .orderby(aq.desc('jumlah_kasus'));

    const cdd_data2 = {
        labels: data_2_2.array('penyakit'),
        datasets: [{
            label: 'Kasus',
            data: data_2_2.array('jumlah_kasus'),
            backgroundColor: data_2_2.array('color'),
            borderColor: data_2_2.array('color'),
            borderWidth: 1,
            
        }]
    };

    bar_cdd.config.data = cdd_data2
    bar_cdd.update()

    let data_3_2 = dt_fltr2
            .filter(d => d.penyakit === 'Diare Akut' ||
            d.penyakit === 'Malaria Konfirmasi' ||
            d.penyakit === 'ILI (Penyakit Serupa Influenza)' || 
            d.penyakit === 'Suspek COVID-19' ||
            d.penyakit === 'Suspek Dengue' || 
            d.penyakit === 'Pnemonia' || 
            d.penyakit === 'Diare Berdarah/ Disentri' || 
            d.penyakit === 'Suspek Demam Tifoid' || 
            d.penyakit === 'Sindrom Jaundice Akut' || 
            d.penyakit === 'Suspek Chikungunya' ||
            d.penyakit === 'Suspek Meningitis/Encephalitis')
            .filter(d => d.minggu === 49 || d.minggu === 50)
            .groupby('tahun_minggu','penyakit')
            .rollup({jumlah_kasus: d => op.sum(d.kasus)})
            .orderby('tahun_minggu')

    const cdt_data2 = {
        labels: [... new Set(data_3_2.array('tahun_minggu'))],
        datasets: [
            {
                label: 'Diare Akut',
                data: data_3_2.filter(d => d.penyakit === 'Diare Akut').array('jumlah_kasus'),
                backgroundColor:'#9ebcda',
                borderColor:'#9ebcda'},
            {
                label: 'Malaria Konfirmasi',
                data: data_3_2.filter(d => d.penyakit === 'Malaria Konfirmasi').array('jumlah_kasus'),
                backgroundColor:'#fdbb84',
                borderColor:'#fdbb84'},
            {
                label: 'ILI (Penyakit Serupa Influenza)',
                data: data_3_2.filter(d => d.penyakit === 'ILI (Penyakit Serupa Influenza)').array('jumlah_kasus'),
                backgroundColor:'#a8ddb5',
                borderColor:'#a8ddb5'},
            {
                label: 'Suspek COVID-19',
                data: data_3_2.filter(d => d.penyakit === 'Suspek COVID-19').array('jumlah_kasus'),
                backgroundColor:'#2b8cbe',
                borderColor:'#2b8cbe'},
            {
                label: 'Pnemonia',
                data: data_3_2.filter(d => d.penyakit === 'Pnemonia').array('jumlah_kasus'),
                backgroundColor:'#a6bddb',
                borderColor:'#a6bddb'},
            {
                label: 'Diare Berdarah/ Disentri',
                data: data_3_2.filter(d => d.penyakit === 'Diare Berdarah/ Disentri').array('jumlah_kasus'),
                backgroundColor:'#8856a7',
                borderColor:'#8856a7'},
            {
                label: 'Suspek Demam Tifoid',
                data: data_3_2.filter(d => d.penyakit === 'Suspek Demam Tifoid').array('jumlah_kasus'),
                backgroundColor:'#c994c7',
                borderColor:'#c994c7'},
            {
                label: 'Sindrom Jaundice Akut',
                data: data_3_2.filter(d => d.penyakit === 'Sindrom Jaundice Akut').array('jumlah_kasus'),
                backgroundColor:'#ece2f0',
                borderColor:'#ece2f0'},
            {
                label: 'Suspek Chikungunya',
                data: data_3_2.filter(d => d.penyakit === 'Suspek Chikungunya').array('jumlah_kasus'),
                backgroundColor:'#c51b8a',
                borderColor:'#c51b8a'},
            {
                label: 'Suspek Meningitis/Encephalitis',
                data: data_3_2.filter(d => d.penyakit === 'Suspek Meningitis/Encephalitis').array('jumlah_kasus'),
                backgroundColor:'#7fcdbb',
                borderColor:'#7fcdbb'}
        ]
    };

    line_cdt.config.data = cdt_data2
    line_cdt.update()

    let data_4_2 = dt_fltr2
            .filter(d => d.penyakit === 'Suspek HFMD' ||
            d.penyakit === 'Suspek Tetanus' ||
            d.penyakit === 'Gigitan Hewan Penular Rabies' || 
            d.penyakit === 'Suspek Campak' ||
            d.penyakit === 'Suspek Kolera' || 
            d.penyakit === 'Acute Flacid Paralysis (AFP)' || 
            d.penyakit === 'Pertussis' || 
            d.penyakit === 'Suspek Leptospirosis' || 
            d.penyakit === 'Sindrom Jaundice Akut' || 
            d.penyakit === 'Kluster Penyakit yang tidak lazim' ||
            d.penyakit === 'Suspek Tetanus Neonatorum' ||
            d.penyakit === 'Suspek Difteri')
            .groupby('penyakit')
            .rollup({jumlah_kasus: d => op.sum(d.kasus)})
            .join(color_p, ['penyakit', 'penyakit'])
            .orderby(aq.desc('jumlah_kasus'));

    const rdd_data2 = {
        labels: data_4_2.array('penyakit'),
        datasets: [{
            label: 'Kasus',
            data: data_4_2.array('jumlah_kasus'),
            backgroundColor:  data_4_2.array('color'),
            borderColor:  data_4_2.array('color'),
            borderWidth: 1,

        }]
    };

    bar_rdd.config.data = rdd_data2
    bar_rdd.update()

    let data_5_2 = dt_fltr2
            .filter(d => d.penyakit === 'Suspek HFMD' ||
            d.penyakit === 'Suspek Tetanus' ||
            d.penyakit === 'Gigitan Hewan Penular Rabies' || 
            d.penyakit === 'Suspek Campak' ||
            d.penyakit === 'Suspek Kolera' || 
            d.penyakit === 'Acute Flacid Paralysis (AFP)' || 
            d.penyakit === 'Pertussis' || 
            d.penyakit === 'Suspek Leptospirosis' || 
            d.penyakit === 'Sindrom Jaundice Akut' || 
            d.penyakit === 'Kluster Penyakit yang tidak lazim' ||
            d.penyakit === 'Suspek Tetanus Neonatorum' ||
            d.penyakit === 'Suspek Difteri')
            .groupby('tahun_minggu','penyakit')
            .rollup({jumlah_kasus: d => op.sum(d.kasus)})
            .orderby('tahun_minggu');

    const rdt_data2 = {
        labels: [... new Set(data_5_2.array('tahun_minggu'))],
        datasets: [
            {
                label: 'Suspek HFMD',
                data: data_5_2.filter(d => d.penyakit === 'Suspek HFMD').array('jumlah_kasus'),
                backgroundColor:'#f7fcb9',
                borderColor:'#f7fcb9'},
            {
                label: 'Suspek Tetanus',
                data: data_5_2.filter(d => d.penyakit === 'Suspek Tetanus').array('jumlah_kasus'),
                backgroundColor:'#2ca25f',
                borderColor:'#2ca25f'},
            {
                label: 'Gigitan Hewan Penular Rabies',
                data: data_5_2.filter(d => d.penyakit === 'Gigitan Hewan Penular Rabies').array('jumlah_kasus'),
                backgroundColor:'#43a2ca',
                borderColor:'#43a2ca'},
            {
                label: 'Suspek Campak',
                data: data_5_2.filter(d => d.penyakit === 'Suspek Campak').array('jumlah_kasus'),
                backgroundColor:'#e34a33',
                borderColor:'#e34a33'},  
            {
                label: 'Suspek Kolera',
                data: data_5_2.filter(d => d.penyakit === 'Suspek Kolera').array('jumlah_kasus'),
                backgroundColor:'#1c9099',
                borderColor:'#1c9099'},
            {
                label: 'Acute Flacid Paralysis (AFP)',
                data: data_5_2.filter(d => d.penyakit === 'Acute Flacid Paralysis (AFP)').array('jumlah_kasus'),
                backgroundColor:'#d95f0e',
                borderColor:'#d95f0e'},
            {
                label: 'Pertussis',
                data: data_5_2.filter(d => d.penyakit === 'Pertussis').array('jumlah_kasus'),
                backgroundColor:'#dd1c77',
                borderColor:'#dd1c77'},
            {
                label: 'Suspek Leptospirosis',
                data: data_5_2.filter(d => d.penyakit === 'Suspek Leptospirosis').array('jumlah_kasus'),
                backgroundColor:'#756bb1',
                borderColor:'#756bb1'},
            {
                label: 'Kluster Penyakit yang tidak lazim',
                data: data_5_2.filter(d => d.penyakit === 'Kluster Penyakit yang tidak lazim').array('jumlah_kasus'),
                backgroundColor:'#bdbdbd',
                borderColor:'#bdbdbd'},
            {
                label: 'Suspek Tetanus Neonatorum',
                data: data_5_2.filter(d => d.penyakit === 'Suspek Tetanus Neonatorum').array('jumlah_kasus'),
                backgroundColor:'#e5f5e0',
                borderColor:'#e5f5e0'},
            {
                label: 'Suspek Difteri',
                data: data_5_2.filter(d => d.penyakit === 'Suspek Difteri').array('jumlah_kasus'),
                backgroundColor:'#fde0dd',
                borderColor:'#fde0dd'}        
        ]
    }

    line_rdt.config.data = rdt_data2
    line_rdt.update()

};

// Filter Data Function
function filterData2(){
    var prov_filter   = document.getElementById("prov_filter");
    var kab_filter    = document.getElementById("kab_filter");
    var kec_filter    = document.getElementById("kec_filter");

    var prov_select = prov_filter.value;
    var kab_select  = kab_filter.value;
    var kec_select  = kec_filter.value;
    var start_date_select  = start_date.value;
    var end_date_select  = end_date.value;

    let start_date_filter = new Date(start_date_select)
    let end_date_filter = new Date(end_date_select)

    
    let dt_fltr2 = dt
                .filter(aq.escape(d =>  d.tanggal >= start_date_filter && d.tanggal <= end_date_filter))
                .filter(aq.escape(d =>  d.provinsi      === prov_select))
                .filter(aq.escape(d =>  d.kabupaten     === kab_select))
                .filter(aq.escape(d =>  d.kecamatan     === kec_select))

    let visit = dt_fltr2
                .rollup({all_visit: d => op.sum(d.kasus)})
                .get('all_visit',0)
    
    
    let cum_case =  dt_fltr2
                    .filter(d => d.penyakit !== 'None')
                    .rollup({all_visit: d => op.sum(d.kasus)})
                    .get('all_visit',0)
    
    let week =  dt_fltr2
                .rollup({max_week: d => op.max(d.minggu)})
                .get('max_week',0)
    
    var cum_case_dsp = document.getElementById("cum_case");
    var visit_dsp = document.getElementById("tot_vis");
    var week_dsp = document.getElementById("week");

    cum_case_dsp.innerHTML = cum_case;
    visit_dsp.innerHTML = visit;
    week_dsp.innerHTML = week;

    
    let data_1_2 = dt_fltr2
            .filter(d => d.penyakit !== 'None')
            .groupby('fasyankes')
            .rollup({jumlah_kasus: d => op.sum(d.kasus)})
            .orderby(aq.desc('jumlah_kasus'));
    
    const cbf_data2 = {
                labels: data_1_2.array('fasyankes'),
                datasets: [{
                    label: 'Kasus',
                    data: data_1_2.array('jumlah_kasus'),
                    borderWidth: 1,
                    
                }]
            };
    bar_cbf.config.data = cbf_data2
    bar_cbf.update()

    let data_2_2 = dt_fltr2
            .filter(d => d.penyakit === 'Diare Akut' ||
            d.penyakit === 'Malaria Konfirmasi' ||
            d.penyakit === 'ILI (Penyakit Serupa Influenza)' || 
            d.penyakit === 'Suspek COVID-19' ||
            d.penyakit === 'Suspek Dengue' || 
            d.penyakit === 'Pnemonia' || 
            d.penyakit === 'Diare Berdarah/ Disentri' || 
            d.penyakit === 'Suspek Demam Tifoid' || 
            d.penyakit === 'Sindrom Jaundice Akut' || 
            d.penyakit === 'Suspek Chikungunya' ||
            d.penyakit === 'Suspek Meningitis/Encephalitis')
            .groupby('penyakit')
            .rollup({jumlah_kasus: d => op.sum(d.kasus)})
            .join(color_p, ['penyakit', 'penyakit'])
            .orderby(aq.desc('jumlah_kasus'));

    const cdd_data2 = {
        labels: data_2_2.array('penyakit'),
        datasets: [{
            label: 'Kasus',
            data: data_2_2.array('jumlah_kasus'),
            backgroundColor: data_2_2.array('color'),
            borderColor: data_2_2.array('color'),
            borderWidth: 1,
            
        }]
    };

    bar_cdd.config.data = cdd_data2
    bar_cdd.update()

    let data_3_2 = dt_fltr2
            .filter(d => d.penyakit === 'Diare Akut' ||
            d.penyakit === 'Malaria Konfirmasi' ||
            d.penyakit === 'ILI (Penyakit Serupa Influenza)' || 
            d.penyakit === 'Suspek COVID-19' ||
            d.penyakit === 'Suspek Dengue' || 
            d.penyakit === 'Pnemonia' || 
            d.penyakit === 'Diare Berdarah/ Disentri' || 
            d.penyakit === 'Suspek Demam Tifoid' || 
            d.penyakit === 'Sindrom Jaundice Akut' || 
            d.penyakit === 'Suspek Chikungunya' ||
            d.penyakit === 'Suspek Meningitis/Encephalitis')
            .groupby('tahun_minggu','penyakit')
            .rollup({jumlah_kasus: d => op.sum(d.kasus)})
            .orderby('tahun_minggu')

    const cdt_data2 = {
        labels: [... new Set(data_3_2.array('tahun_minggu'))],
        datasets: [
            {
                label: 'Diare Akut',
                data: data_3_2.filter(d => d.penyakit === 'Diare Akut').array('jumlah_kasus'),
                backgroundColor:'#9ebcda',
                borderColor:'#9ebcda'},
            {
                label: 'Malaria Konfirmasi',
                data: data_3_2.filter(d => d.penyakit === 'Malaria Konfirmasi').array('jumlah_kasus'),
                backgroundColor:'#fdbb84',
                borderColor:'#fdbb84'},
            {
                label: 'ILI (Penyakit Serupa Influenza)',
                data: data_3_2.filter(d => d.penyakit === 'ILI (Penyakit Serupa Influenza)').array('jumlah_kasus'),
                backgroundColor:'#a8ddb5',
                borderColor:'#a8ddb5'},
            {
                label: 'Suspek COVID-19',
                data: data_3_2.filter(d => d.penyakit === 'Suspek COVID-19').array('jumlah_kasus'),
                backgroundColor:'#2b8cbe',
                borderColor:'#2b8cbe'},
            {
                label: 'Pnemonia',
                data: data_3_2.filter(d => d.penyakit === 'Pnemonia').array('jumlah_kasus'),
                backgroundColor:'#a6bddb',
                borderColor:'#a6bddb'},
            {
                label: 'Diare Berdarah/ Disentri',
                data: data_3_2.filter(d => d.penyakit === 'Diare Berdarah/ Disentri').array('jumlah_kasus'),
                backgroundColor:'#8856a7',
                borderColor:'#8856a7'},
            {
                label: 'Suspek Demam Tifoid',
                data: data_3_2.filter(d => d.penyakit === 'Suspek Demam Tifoid').array('jumlah_kasus'),
                backgroundColor:'#c994c7',
                borderColor:'#c994c7'},
            {
                label: 'Sindrom Jaundice Akut',
                data: data_3_2.filter(d => d.penyakit === 'Sindrom Jaundice Akut').array('jumlah_kasus'),
                backgroundColor:'#ece2f0',
                borderColor:'#ece2f0'},
            {
                label: 'Suspek Chikungunya',
                data: data_3_2.filter(d => d.penyakit === 'Suspek Chikungunya').array('jumlah_kasus'),
                backgroundColor:'#c51b8a',
                borderColor:'#c51b8a'},
            {
                label: 'Suspek Meningitis/Encephalitis',
                data: data_3_2.filter(d => d.penyakit === 'Suspek Meningitis/Encephalitis').array('jumlah_kasus'),
                backgroundColor:'#7fcdbb',
                borderColor:'#7fcdbb'}
        ],
    };

    line_cdt.config.data = cdt_data2
    line_cdt.update()

    let data_4_2 = dt_fltr2
            .filter(d => d.penyakit === 'Suspek HFMD' ||
            d.penyakit === 'Suspek Tetanus' ||
            d.penyakit === 'Gigitan Hewan Penular Rabies' || 
            d.penyakit === 'Suspek Campak' ||
            d.penyakit === 'Suspek Kolera' || 
            d.penyakit === 'Acute Flacid Paralysis (AFP)' || 
            d.penyakit === 'Pertussis' || 
            d.penyakit === 'Suspek Leptospirosis' || 
            d.penyakit === 'Kluster Penyakit yang tidak lazim' ||
            d.penyakit === 'Suspek Tetanus Neonatorum' ||
            d.penyakit === 'Suspek Difteri')
            .groupby('penyakit')
            .rollup({jumlah_kasus: d => op.sum(d.kasus)})
            .join(color_p, ['penyakit', 'penyakit'])
            .orderby(aq.desc('jumlah_kasus'));

    const rdd_data2 = {
        labels: data_4_2.array('penyakit'),
        datasets: [{
            label: 'Kasus',
            data: data_4_2.array('jumlah_kasus'),
            backgroundColor:  data_4_2.array('color'),
            borderColor:  data_4_2.array('color'),
            borderWidth: 1,
            
        }]
    };

    bar_rdd.config.data = rdd_data2
    bar_rdd.update()

    let data_5_2 = dt_fltr2
            .filter(d => d.penyakit === 'Suspek HFMD' ||
            d.penyakit === 'Suspek Tetanus' ||
            d.penyakit === 'Gigitan Hewan Penular Rabies' || 
            d.penyakit === 'Suspek Campak' ||
            d.penyakit === 'Suspek Kolera' || 
            d.penyakit === 'Acute Flacid Paralysis (AFP)' || 
            d.penyakit === 'Pertussis' || 
            d.penyakit === 'Suspek Leptospirosis' || 
            d.penyakit === 'Kluster Penyakit yang tidak lazim' ||
            d.penyakit === 'Suspek Tetanus Neonatorum' ||
            d.penyakit === 'Suspek Difteri')
            .groupby('tahun_minggu','penyakit')
            .rollup({jumlah_kasus: d => op.sum(d.kasus)})
            .orderby('tahun_minggu');

    const rdt_data2 = {
        labels: [... new Set(data_5_2.array('tahun_minggu'))],
        datasets: [
            {
                label: 'Suspek HFMD',
                data: data_5_2.filter(d => d.penyakit === 'Suspek HFMD').array('jumlah_kasus'),
                backgroundColor:'#f7fcb9',
                borderColor:'#f7fcb9'},
            {
                label: 'Suspek Tetanus',
                data: data_5_2.filter(d => d.penyakit === 'Suspek Tetanus').array('jumlah_kasus'),
                backgroundColor:'#2ca25f',
                borderColor:'#2ca25f'},
            {
                label: 'Gigitan Hewan Penular Rabies',
                data: data_5_2.filter(d => d.penyakit === 'Gigitan Hewan Penular Rabies').array('jumlah_kasus'),
                backgroundColor:'#43a2ca',
                borderColor:'#43a2ca'},
            {
                label: 'Suspek Campak',
                data: data_5_2.filter(d => d.penyakit === 'Suspek Campak').array('jumlah_kasus'),
                backgroundColor:'#e34a33',
                borderColor:'#e34a33'},  
            {
                label: 'Suspek Kolera',
                data: data_5_2.filter(d => d.penyakit === 'Suspek Kolera').array('jumlah_kasus'),
                backgroundColor:'#1c9099',
                borderColor:'#1c9099'},
            {
                label: 'Acute Flacid Paralysis (AFP)',
                data: data_5_2.filter(d => d.penyakit === 'Acute Flacid Paralysis (AFP)').array('jumlah_kasus'),
                backgroundColor:'#d95f0e',
                borderColor:'#d95f0e'},
            {
                label: 'Pertussis',
                data: data_5_2.filter(d => d.penyakit === 'Pertussis').array('jumlah_kasus'),
                backgroundColor:'#dd1c77',
                borderColor:'#dd1c77'},
            {
                label: 'Suspek Leptospirosis',
                data: data_5_2.filter(d => d.penyakit === 'Suspek Leptospirosis').array('jumlah_kasus'),
                backgroundColor:'#756bb1',
                borderColor:'#756bb1'},
            {
                label: 'Kluster Penyakit yang tidak lazim',
                data: data_5_2.filter(d => d.penyakit === 'Kluster Penyakit yang tidak lazim').array('jumlah_kasus'),
                backgroundColor:'#bdbdbd',
                borderColor:'#bdbdbd'},
            {
                label: 'Suspek Tetanus Neonatorum',
                data: data_5_2.filter(d => d.penyakit === 'Suspek Tetanus Neonatorum').array('jumlah_kasus'),
                backgroundColor:'#e5f5e0',
                borderColor:'#e5f5e0'},
            {
                label: 'Suspek Difteri',
                data: data_5_2.filter(d => d.penyakit === 'Suspek Difteri').array('jumlah_kasus'),
                backgroundColor:'#fde0dd',
                borderColor:'#fde0dd'}        
        ]
    }

    line_rdt.config.data = rdt_data2
    line_rdt.update()

};



// Coba 
// kab_array = dt.['kabupaten'];
// let heatmap = dt
// .params({
// kab:kab_array
// })
// .filter((d, $) => op.includes($.kab, d.kecamatan))
// .print()

// console.log('coba');


                   