//----------------------------------------------------- Data Loading -------------------------------------------------------//

let file_path = 'https://raw.githubusercontent.com/jokoeliyanto/web-dashboard-from-scratch/main/data_all_agg_pkm.csv';
let warna_p = 'https://raw.githubusercontent.com/jokoeliyanto/web-dashboard-from-scratch/main/warna_penyakit.csv';


var color_p = await aq.loadCSV(warna_p);
var dt = await aq.loadCSV(file_path);

console.log('Initial Data')
dt.print();

//--------------------------------------------------------- Filter Box ---------------------------------------------------------//
const prov_filter = document.getElementById("prov_filter");
const kab_filter = document.getElementById("kab_filter");
const kec_filter = document.getElementById("kec_filter");
const start_date = document.getElementById("start_date");
const end_date = document.getElementById("end_date");

var dt_prov = dt
    .filter(aq.escape(d => d.provinsi === 'BALI'));
var dt_kab = dt
    .filter(aq.escape(d => d.provinsi === 'BALI'))
    .filter(aq.escape(d => d.kabupaten === 'KAB. BADUNG'));
var dt_kec = dt
    .filter(aq.escape(d => d.provinsi === 'BALI'))
    .filter(aq.escape(d => d.kabupaten === 'KAB. BADUNG'))
    .filter(aq.escape(d => d.kecamatan === 'ABIANSEMAL'));

console.log("CHILDREn", kab_filter)

const filter_prov_ar = [... new Set(dt.array('provinsi').sort())];
const filter_kab_ar = [... new Set(dt_prov.array('kabupaten').sort())];
const filter_kec_ar = [... new Set(dt_kab.array('kecamatan').sort())];

filter_prov_ar.forEach(function (item) {
    let o = document.createElement("option");
    o.text = item;
    o.value = item;
    prov_filter.appendChild(o);
});

filter_kab_ar.forEach(function (item) {
    let o = document.createElement("option");
    o.text = item;
    o.value = item;
    kab_filter.appendChild(o);
});

filter_kec_ar.forEach(function (item) {
    let o = document.createElement("option");
    o.text = item;
    o.value = item;
    kec_filter.appendChild(o);
});


//--------------------------------------------------------- Card Box ---------------------------------------------------------//

var prov_select = prov_filter.value;
var kab_select = kab_filter.value;
var kec_select = kec_filter.value;
var start_date_select = start_date.value;
var end_date_select = end_date.value;

let start_date_filter = new Date(start_date_select)
let end_date_filter = new Date(end_date_select)

// All Visit
// Semua kunjungan pasien untuk semua penyakit

let dt_filter = dt
    .filter(aq.escape(d => d.tanggal >= start_date_filter && d.tanggal <= end_date_filter))
    .filter(aq.escape(d => d.provinsi === prov_select))
    .filter(aq.escape(d => d.kabupaten === kab_select))
    .filter(aq.escape(d => d.kecamatan === kec_select))

let visit = dt_filter
    .rollup({ all_visit: d => op.sum(d.kasus) })
    .get('all_visit', 0)

// Cumulative Case 
// Kunjungan pasien dengan penyakit SKDR


let cum_case = dt_filter
    .filter(d => d.penyakit !== 'None')
    .rollup({ all_visit: d => op.sum(d.kasus) })
    .get('all_visit', 0)


// Week
// Minggu min dan max data

let week = dt_filter
    .rollup({ max_week: d => op.max(d.minggu) })
    .get('max_week', 0)

var cum_case_dsp = document.getElementById("cum_case");
var visit_dsp = document.getElementById("tot_vis");
var week_dsp = document.getElementById("week");

cum_case_dsp.innerHTML = cum_case;
visit_dsp.innerHTML = visit;
week_dsp.innerHTML = week;


//--------------------------------------------------------- Chart Box ---------------------------------------------------------//

// ################################################## 1. Cases By Fasyankes ################################################## //

// Data Preprocessing
let data_1 = dt_filter
    .filter(d => d.penyakit !== 'None')
    .groupby('fasyankes')
    .rollup({ jumlah_kasus: d => op.sum(d.kasus) })
    .orderby(aq.desc('jumlah_kasus'));


// Setup Block
const cba_data = {
    labels: data_1.array('fasyankes'),
    datasets: [{
        label: 'Kasus',
        data: data_1.array('jumlah_kasus'),
        borderWidth: 1,

    }]
};
// Config Block
const config_cba = {
    type: 'bar',
    data: cba_data,
    options: {
        aspectRatio: 2,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Kecamatan',
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Kasus',
                }
            }
        },
        indexAxis: 'y', //Vertical Bar => x,  Horizontal Bar=> y
        plugins: {
            title: {
                display: true,
                position: 'top',
                align: 'center',  // left=> "start", right=> "end"
                text: 'Case By Fasyankes',
                padding: {
                    top: 10,
                    bottom: 10
                },
                font: {
                    size: 22
                }
            },
            subtitle: {
                display: false,
                text: 'Tanggal: 01 Desember 2022 - 31 Desember 2022',
                padding: {
                    top: 10,
                    bottom: 10
                },
                font: {
                    size: 12
                }
            },
            legend: {
                display: false,
            }
        }
    }
};
// Render Block
const cba_Chart = new Chart(
    document.getElementById('cba_chart'),
    config_cba
);


// ################################################## 2. Common Disease Bar Chart ################################################## //

// Data Preprocessing

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
    .rollup({ jumlah_kasus: d => op.sum(d.kasus) })
    .join(color_p, ['penyakit', 'penyakit'])
    .orderby(aq.desc('jumlah_kasus'));
console.log('data_2', data_2);
// Setup Block
const cdb_data = {
    labels: data_2.array('penyakit'),
    datasets: [{
        label: 'Kasus',
        data: data_2.array('jumlah_kasus'),
        backgroundColor: data_2.array('color'),
        borderColor: data_2.array('color'),
        borderWidth: 1,

    }]
};
// Config Block
const config_cdb = {
    type: 'bar',
    data: cdb_data,
    options: {
        aspectRatio: 2,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Penyakit',
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Kasus',
                }
            }
        },
        indexAxis: 'y', //Vertical Bar => x,  Horizontal Bar=> y
        plugins: {
            title: {
                display: true,
                position: 'top',
                align: 'center',  // left=> "start", right=> "end"
                text: 'Common Disease Distribution',
                padding: {
                    top: 10,
                    bottom: 10
                },
                font: {
                    size: 22
                }
            },
            subtitle: {
                display: false,
                text: 'Tanggal: 01 Desember 2022 - 31 Desember 2022',
                padding: {
                    top: 10,
                    bottom: 10
                },
                font: {
                    size: 12
                }
            },
            legend: {
                display: false,
            }
        }
    }
};
// Render Block
const cdb_Chart = new Chart(
    document.getElementById('cdb_chart'),
    config_cdb
);

// ################################################## 3. Common Disease Trend Chart ################################################## //

// Data Preprocessing

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
    .groupby('tahun_minggu', 'penyakit')
    .rollup({ jumlah_kasus: d => op.sum(d.kasus) })
    .orderby('tahun_minggu')

// Setup Block
const cdt_data = {
    labels: [... new Set(data_3.array('tahun_minggu'))],
    datasets: [
        {
            label: 'Diare Akut',
            data: data_3.filter(d => d.penyakit === 'Diare Akut').array('jumlah_kasus'),
            backgroundColor: '#9ebcda',
            borderColor: '#9ebcda'
        },
        {
            label: 'Malaria Konfirmasi',
            data: data_3.filter(d => d.penyakit === 'Malaria Konfirmasi').array('jumlah_kasus'),
            backgroundColor: '#fdbb84',
            borderColor: '#fdbb84'
        },
        {
            label: 'ILI (Penyakit Serupa Influenza)',
            data: data_3.filter(d => d.penyakit === 'ILI (Penyakit Serupa Influenza)').array('jumlah_kasus'),
            backgroundColor: '#a8ddb5',
            borderColor: '#a8ddb5'
        },
        {
            label: 'Suspek COVID-19',
            data: data_3.filter(d => d.penyakit === 'Suspek COVID-19').array('jumlah_kasus'),
            backgroundColor: '#2b8cbe',
            borderColor: '#2b8cbe'
        },
        {
            label: 'Pnemonia',
            data: data_3.filter(d => d.penyakit === 'Pnemonia').array('jumlah_kasus'),
            backgroundColor: '#a6bddb',
            borderColor: '#a6bddb'
        },
        {
            label: 'Diare Berdarah/ Disentri',
            data: data_3.filter(d => d.penyakit === 'Diare Berdarah/ Disentri').array('jumlah_kasus'),
            backgroundColor: '#8856a7',
            borderColor: '#8856a7'
        },
        {
            label: 'Suspek Demam Tifoid',
            data: data_3.filter(d => d.penyakit === 'Suspek Demam Tifoid').array('jumlah_kasus'),
            backgroundColor: '#c994c7',
            borderColor: '#c994c7'
        },
        {
            label: 'Sindrom Jaundice Akut',
            data: data_3.filter(d => d.penyakit === 'Sindrom Jaundice Akut').array('jumlah_kasus'),
            backgroundColor: '#ece2f0',
            borderColor: '#ece2f0'
        },
        {
            label: 'Suspek Chikungunya',
            data: data_3.filter(d => d.penyakit === 'Suspek Chikungunya').array('jumlah_kasus'),
            backgroundColor: '#c51b8a',
            borderColor: '#c51b8a'
        },
        {
            label: 'Suspek Meningitis/Encephalitis',
            data: data_3.filter(d => d.penyakit === 'Suspek Meningitis/Encephalitis').array('jumlah_kasus'),
            backgroundColor: '#7fcdbb',
            borderColor: '#7fcdbb'
        }
    ],
}

// Config Block
const config_cdt = {
    type: 'line',
    data: cdt_data,
    options: {
        aspectRatio: 2,
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Kasus',
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Tahun - Minggu',
                }
            }
        },
        // indexAxis : 'y', //Vertical Bar => x,  Horizontal Bar=> y
        plugins: {
            title: {
                display: true,
                position: 'top',
                align: 'center',  // left=> "start", right=> "end"
                text: 'Common Disease Trend',
                padding: {
                    top: 10,
                    bottom: 10
                },
                font: {
                    size: 22
                }
            },
            subtitle: {
                display: false,
                text: 'Tanggal: 01 Desember 2022 - 31 Desember 2022',
                padding: {
                    top: 10,
                    bottom: 10
                },
                font: {
                    size: 12
                }
            },
            legend: {
                display: false,
                position: 'right'
            }
        }
    }
};

// Render Block
const cdt_Chart = new Chart(
    document.getElementById('cdt_chart'),
    config_cdt
);

// ################################################## 4. Rare Disease Bar Chart ################################################## //

// Data Preprocessing

let data_4 = dt_filter
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
    .rollup({ jumlah_kasus: d => op.sum(d.kasus) })
    .join(color_p, ['penyakit', 'penyakit'])
    .orderby(aq.desc('jumlah_kasus'));

// Setup Block
const rdb_data = {
    labels: data_4.array('penyakit'),
    datasets: [{
        label: 'Kasus',
        data: data_4.array('jumlah_kasus'),
        backgroundColor: data_4.array('color'),
        borderColor: data_4.array('color'),
        borderWidth: 1,

    }]
};
// Config Block
const config_rdb = {
    type: 'bar',
    data: rdb_data,
    options: {
        aspectRatio: 2,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Penyakit',
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Kasus',
                }
            }
        },
        indexAxis: 'y', //Vertical Bar => x,  Horizontal Bar=> y
        plugins: {
            title: {
                display: true,
                position: 'top',
                align: 'center',  // left=> "start", right=> "end"
                text: 'Rare Disease Distribution',
                padding: {
                    top: 10,
                    bottom: 10
                },
                font: {
                    size: 22
                }
            },
            subtitle: {
                display: false,
                text: 'Tanggal: 01 Desember 2022 - 31 Desember 2022',
                padding: {
                    top: 10,
                    bottom: 10
                },
                font: {
                    size: 12
                }
            },
            legend: {
                display: false,
            }
        }
    }
};
// Render Block
const rdb_Chart = new Chart(
    document.getElementById('rdb_chart'),
    config_rdb
);

// ################################################## 5. Rare Disease Trend Chart ################################################## //

// Data Preprocessing

let data_5 = dt_filter
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
    .groupby('tahun_minggu', 'penyakit')
    .rollup({ jumlah_kasus: d => op.sum(d.kasus) })
    .orderby('tahun_minggu');

    console.log('data5',data_5.array('tahun_minggu'));
// Setup Block
const rdt_data = {
    labels: [... new Set(data_5.array('tahun_minggu'))],
    datasets: [
        {
            label: 'Suspek HFMD',
            data: data_5.filter(d => d.penyakit === 'Suspek HFMD').array('jumlah_kasus'),
            backgroundColor: '#f7fcb9',
            borderColor: '#f7fcb9'
        },
        {
            label: 'Suspek Tetanus',
            data: data_5.filter(d => d.penyakit === 'Suspek Tetanus').array('jumlah_kasus'),
            backgroundColor: '#2ca25f',
            borderColor: '#2ca25f'
        },
        {
            label: 'Gigitan Hewan Penular Rabies',
            data: data_5.filter(d => d.penyakit === 'Gigitan Hewan Penular Rabies').array('jumlah_kasus'),
            backgroundColor: '#43a2ca',
            borderColor: '#43a2ca'
        },
        {
            label: 'Suspek Campak',
            data: data_5.filter(d => d.penyakit === 'Suspek Campak').array('jumlah_kasus'),
            backgroundColor: '#e34a33',
            borderColor: '#e34a33'
        },
        {
            label: 'Suspek Kolera',
            data: data_5.filter(d => d.penyakit === 'Suspek Kolera').array('jumlah_kasus'),
            backgroundColor: '#1c9099',
            borderColor: '#1c9099'
        },
        {
            label: 'Acute Flacid Paralysis (AFP)',
            data: data_5.filter(d => d.penyakit === 'Acute Flacid Paralysis (AFP)').array('jumlah_kasus'),
            backgroundColor: '#d95f0e',
            borderColor: '#d95f0e'
        },
        {
            label: 'Pertussis',
            data: data_5.filter(d => d.penyakit === 'Pertussis').array('jumlah_kasus'),
            backgroundColor: '#dd1c77',
            borderColor: '#dd1c77'
        },
        {
            label: 'Suspek Leptospirosis',
            data: data_5.filter(d => d.penyakit === 'Suspek Leptospirosis').array('jumlah_kasus'),
            backgroundColor: '#756bb1',
            borderColor: '#756bb1'
        },
        {
            label: 'Kluster Penyakit yang tidak lazim',
            data: data_5.filter(d => d.penyakit === 'Kluster Penyakit yang tidak lazim').array('jumlah_kasus'),
            backgroundColor: '#bdbdbd',
            borderColor: '#bdbdbd'
        },
        {
            label: 'Suspek Tetanus Neonatorum',
            data: data_5.filter(d => d.penyakit === 'Suspek Tetanus Neonatorum').array('jumlah_kasus'),
            backgroundColor: '#e5f5e0',
            borderColor: '#e5f5e0'
        },
        {
            label: 'Suspek Difteri',
            data: data_5.filter(d => d.penyakit === 'Suspek Difteri').array('jumlah_kasus'),
            backgroundColor: '#fde0dd',
            borderColor: '#fde0dd'
        }
    ]
}

// Config Block
const config_rdt = {
    type: 'line',
    data: rdt_data,
    options: {
        aspectRatio: 2,
        responsive: true,
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Kasus',
                }
            },
            x: {
                title: {
                    display: true,
                    text: 'Tahun - Minggu',
                }
            }
        },
        // indexAxis : 'y', //Vertical Bar => x,  Horizontal Bar=> y
        plugins: {
            title: {
                display: true,
                position: 'top',
                align: 'center',  // left=> "start", right=> "end"
                text: 'Rare Disease Trend',
                padding: {
                    top: 10,
                    bottom: 10
                },
                font: {
                    size: 22
                }
            },
            subtitle: {
                display: false,
                text: 'Tanggal: 01 Desember 2022 - 31 Desember 2022',
                padding: {
                    top: 10,
                    bottom: 10
                },
                font: {
                    size: 12
                }
            },
            legend: {
                display: false,
                position: 'right'
            }
        }
    }
};

// Render Block
const rdt_Chart = new Chart(
    document.getElementById('rdt_chart'),
    config_rdt
);


prov_filter.addEventListener('change', filterData);
kab_filter.addEventListener('change', filterData);
kec_filter.addEventListener('change', filterData2);
start_date.addEventListener('change', filterData);
end_date.addEventListener('change', filterData);

function updateFilterDropdown() {

}
// Filter Data Function
function filterData() {
    var prov_filter = document.getElementById("prov_filter");
    var kab_filter = document.getElementById("kab_filter");
    var kec_filter = document.getElementById("kec_filter");

    var prov_select = prov_filter.value;
    var kab_select = kab_filter.value;
    var kec_select = kec_filter.value;
    var start_date_select = start_date.value;
    var end_date_select = end_date.value;

    let start_date_filter = new Date(start_date_select)
    let end_date_filter = new Date(end_date_select)

    var dt_prov = dt
        .filter(aq.escape(d => d.provinsi === prov_select));
    var dt_kab = dt
        .filter(aq.escape(d => d.provinsi === prov_select))
        .filter(aq.escape(d => d.kabupaten === kab_select));

    var filter_prov_ar2 = [... new Set(dt.array('provinsi').sort())];
    var filter_kab_ar2 = [... new Set(dt_prov.array('kabupaten').sort())];
    var filter_kec_ar2 = [... new Set(dt_kab.array('kecamatan').sort())];

    var options = document.querySelectorAll('#prov_filter option')
    options.forEach(o => o.remove());

    filter_prov_ar2.forEach(function (item) {
        let o = document.createElement("option");
        o.text = item;
        o.value = item;
        prov_filter.appendChild(o);
        prov_filter.value = prov_select;
    });

    console.log("Array Baru", filter_kab_ar2)
    var options = document.querySelectorAll('#kab_filter option')
    options.forEach(o => o.remove());

    filter_kab_ar2.forEach(function (item) {
        let o = document.createElement("option");
        o.text = item;
        o.value = item;
        kab_filter.appendChild(o);
        kab_filter.value = kab_select;
    });

    var options = document.querySelectorAll('#kec_filter option')
    options.forEach(o => o.remove());
    filter_kec_ar2.forEach(function (item) {
        let o = document.createElement("option");
        o.text = item;
        o.value = item;
        kec_filter.appendChild(o);
    });
    var prov_filter = document.getElementById("prov_filter");
    var kab_filter = document.getElementById("kab_filter");
    var kec_filter = document.getElementById("kec_filter");

    var prov_select = prov_filter.value;
    var kab_select = kab_filter.value;
    var kec_select = kec_filter.value;
    var start_date_select = start_date.value;
    var end_date_select = end_date.value;

    var dt_prov = dt
        .filter(aq.escape(d => d.provinsi === prov_select));
    var dt_kab = dt
        .filter(aq.escape(d => d.provinsi === prov_select))
        .filter(aq.escape(d => d.kabupaten === kab_select));

    var filter_prov_ar2 = [... new Set(dt.array('provinsi').sort())];
    var filter_kab_ar2 = [... new Set(dt_prov.array('kabupaten').sort())];
    var filter_kec_ar2 = [... new Set(dt_kab.array('kecamatan').sort())];

    var options = document.querySelectorAll('#prov_filter option')
    options.forEach(o => o.remove());

    filter_prov_ar2.forEach(function (item) {
        let o = document.createElement("option");
        o.text = item;
        o.value = item;
        prov_filter.appendChild(o);
        prov_filter.value = prov_select;
    });

    console.log("Array Baru", filter_kab_ar2)
    var options = document.querySelectorAll('#kab_filter option')
    options.forEach(o => o.remove());

    filter_kab_ar2.forEach(function (item) {
        let o = document.createElement("option");
        o.text = item;
        o.value = item;
        kab_filter.appendChild(o);
        kab_filter.value = kab_select;
    });

    var options = document.querySelectorAll('#kec_filter option')
    options.forEach(o => o.remove());
    filter_kec_ar2.forEach(function (item) {
        let o = document.createElement("option");
        o.text = item;
        o.value = item;
        kec_filter.appendChild(o);
    });

    var prov_filter = document.getElementById("prov_filter");
    var kab_filter = document.getElementById("kab_filter");
    var kec_filter = document.getElementById("kec_filter");

    var prov_select2 = prov_filter.value;
    var kab_select2 = kab_filter.value;
    var kec_select2 = kec_filter.value;

    console.log('Sebelum', prov_select)
    console.log('Sesudah', prov_select2)
    console.log('Sebelum', kab_select)
    console.log('Sesudah', kab_select2)
    console.log('Sebelum', kec_select)
    console.log('Sesudah', kec_select2)
    let dt_fltr2 = dt
        .filter(aq.escape(d => d.tanggal >= start_date_filter && d.tanggal <= end_date_filter))
        .filter(aq.escape(d => d.provinsi === prov_select2))
        .filter(aq.escape(d => d.kabupaten === kab_select2))
        .filter(aq.escape(d => d.kecamatan === kec_select2))

    let visit = dt_fltr2
        .rollup({ all_visit: d => op.sum(d.kasus) })
        .get('all_visit', 0)

    let cum_case = dt_fltr2
        .filter(d => d.penyakit !== 'None')
        .rollup({ all_visit: d => op.sum(d.kasus) })
        .get('all_visit', 0)

    let week = dt_fltr2
        .rollup({ max_week: d => op.max(d.minggu) })
        .get('max_week', 0)

    var cum_case_dsp = document.getElementById("cum_case");
    var visit_dsp = document.getElementById("tot_vis");
    var week_dsp = document.getElementById("week");

    cum_case_dsp.innerHTML = cum_case;
    visit_dsp.innerHTML = visit;
    week_dsp.innerHTML = week;


    let data_1_2 = dt_fltr2
        .filter(d => d.penyakit !== 'None')
        .groupby('fasyankes')
        .rollup({ jumlah_kasus: d => op.sum(d.kasus) })
        .orderby(aq.desc('jumlah_kasus'));

    const cba_data2 = {
        labels: data_1_2.array('fasyankes'),
        datasets: [{
            label: 'Kasus',
            data: data_1_2.array('jumlah_kasus'),
            borderWidth: 1,

        }]
    };
    cba_Chart.config.data = cba_data2
    cba_Chart.update()

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
        .rollup({ jumlah_kasus: d => op.sum(d.kasus) })
        .join(color_p, ['penyakit', 'penyakit'])
        .orderby(aq.desc('jumlah_kasus'));

    const cdb_data2 = {
        labels: data_2_2.array('penyakit'),
        datasets: [{
            label: 'Kasus',
            data: data_2_2.array('jumlah_kasus'),
            backgroundColor: data_2_2.array('color'),
            borderColor: data_2_2.array('color'),
            borderWidth: 1,

        }]
    };

    cdb_Chart.config.data = cdb_data2
    cdb_Chart.update()

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
        .groupby('tahun_minggu', 'penyakit')
        .rollup({ jumlah_kasus: d => op.sum(d.kasus) })
        .orderby('tahun_minggu')

    const cdt_data2 = {
        labels: [... new Set(data_3_2.array('tahun_minggu'))],
        datasets: [
            {
                label: 'Diare Akut',
                data: data_3_2.filter(d => d.penyakit === 'Diare Akut').array('jumlah_kasus'),
                backgroundColor: '#9ebcda',
                borderColor: '#9ebcda'
            },
            {
                label: 'Malaria Konfirmasi',
                data: data_3_2.filter(d => d.penyakit === 'Malaria Konfirmasi').array('jumlah_kasus'),
                backgroundColor: '#fdbb84',
                borderColor: '#fdbb84'
            },
            {
                label: 'ILI (Penyakit Serupa Influenza)',
                data: data_3_2.filter(d => d.penyakit === 'ILI (Penyakit Serupa Influenza)').array('jumlah_kasus'),
                backgroundColor: '#a8ddb5',
                borderColor: '#a8ddb5'
            },
            {
                label: 'Suspek COVID-19',
                data: data_3_2.filter(d => d.penyakit === 'Suspek COVID-19').array('jumlah_kasus'),
                backgroundColor: '#2b8cbe',
                borderColor: '#2b8cbe'
            },
            {
                label: 'Pnemonia',
                data: data_3_2.filter(d => d.penyakit === 'Pnemonia').array('jumlah_kasus'),
                backgroundColor: '#a6bddb',
                borderColor: '#a6bddb'
            },
            {
                label: 'Diare Berdarah/ Disentri',
                data: data_3_2.filter(d => d.penyakit === 'Diare Berdarah/ Disentri').array('jumlah_kasus'),
                backgroundColor: '#8856a7',
                borderColor: '#8856a7'
            },
            {
                label: 'Suspek Demam Tifoid',
                data: data_3_2.filter(d => d.penyakit === 'Suspek Demam Tifoid').array('jumlah_kasus'),
                backgroundColor: '#c994c7',
                borderColor: '#c994c7'
            },
            {
                label: 'Sindrom Jaundice Akut',
                data: data_3_2.filter(d => d.penyakit === 'Sindrom Jaundice Akut').array('jumlah_kasus'),
                backgroundColor: '#ece2f0',
                borderColor: '#ece2f0'
            },
            {
                label: 'Suspek Chikungunya',
                data: data_3_2.filter(d => d.penyakit === 'Suspek Chikungunya').array('jumlah_kasus'),
                backgroundColor: '#c51b8a',
                borderColor: '#c51b8a'
            },
            {
                label: 'Suspek Meningitis/Encephalitis',
                data: data_3_2.filter(d => d.penyakit === 'Suspek Meningitis/Encephalitis').array('jumlah_kasus'),
                backgroundColor: '#7fcdbb',
                borderColor: '#7fcdbb'
            }
        ],
    };

    cdt_Chart.config.data = cdt_data2
    cdt_Chart.update()

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
        .rollup({ jumlah_kasus: d => op.sum(d.kasus) })
        .join(color_p, ['penyakit', 'penyakit'])
        .orderby(aq.desc('jumlah_kasus'));

    const rdb_data2 = {
        labels: data_4_2.array('penyakit'),
        datasets: [{
            label: 'Kasus',
            data: data_4_2.array('jumlah_kasus'),
            backgroundColor: data_4_2.array('color'),
            borderColor: data_4_2.array('color'),
            borderWidth: 1,

        }]
    };

    rdb_Chart.config.data = rdb_data2
    rdb_Chart.update()

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
        .groupby('tahun_minggu', 'penyakit')
        .rollup({ jumlah_kasus: d => op.sum(d.kasus) })
        .orderby('tahun_minggu');

    const rdt_data2 = {
        labels: [... new Set(data_5_2.array('tahun_minggu'))],
        datasets: [
            {
                label: 'Suspek HFMD',
                data: data_5_2.filter(d => d.penyakit === 'Suspek HFMD').array('jumlah_kasus'),
                backgroundColor: '#f7fcb9',
                borderColor: '#f7fcb9'
            },
            {
                label: 'Suspek Tetanus',
                data: data_5_2.filter(d => d.penyakit === 'Suspek Tetanus').array('jumlah_kasus'),
                backgroundColor: '#2ca25f',
                borderColor: '#2ca25f'
            },
            {
                label: 'Gigitan Hewan Penular Rabies',
                data: data_5_2.filter(d => d.penyakit === 'Gigitan Hewan Penular Rabies').array('jumlah_kasus'),
                backgroundColor: '#43a2ca',
                borderColor: '#43a2ca'
            },
            {
                label: 'Suspek Campak',
                data: data_5_2.filter(d => d.penyakit === 'Suspek Campak').array('jumlah_kasus'),
                backgroundColor: '#e34a33',
                borderColor: '#e34a33'
            },
            {
                label: 'Suspek Kolera',
                data: data_5_2.filter(d => d.penyakit === 'Suspek Kolera').array('jumlah_kasus'),
                backgroundColor: '#1c9099',
                borderColor: '#1c9099'
            },
            {
                label: 'Acute Flacid Paralysis (AFP)',
                data: data_5_2.filter(d => d.penyakit === 'Acute Flacid Paralysis (AFP)').array('jumlah_kasus'),
                backgroundColor: '#d95f0e',
                borderColor: '#d95f0e'
            },
            {
                label: 'Pertussis',
                data: data_5_2.filter(d => d.penyakit === 'Pertussis').array('jumlah_kasus'),
                backgroundColor: '#dd1c77',
                borderColor: '#dd1c77'
            },
            {
                label: 'Suspek Leptospirosis',
                data: data_5_2.filter(d => d.penyakit === 'Suspek Leptospirosis').array('jumlah_kasus'),
                backgroundColor: '#756bb1',
                borderColor: '#756bb1'
            },
            {
                label: 'Kluster Penyakit yang tidak lazim',
                data: data_5_2.filter(d => d.penyakit === 'Kluster Penyakit yang tidak lazim').array('jumlah_kasus'),
                backgroundColor: '#bdbdbd',
                borderColor: '#bdbdbd'
            },
            {
                label: 'Suspek Tetanus Neonatorum',
                data: data_5_2.filter(d => d.penyakit === 'Suspek Tetanus Neonatorum').array('jumlah_kasus'),
                backgroundColor: '#e5f5e0',
                borderColor: '#e5f5e0'
            },
            {
                label: 'Suspek Difteri',
                data: data_5_2.filter(d => d.penyakit === 'Suspek Difteri').array('jumlah_kasus'),
                backgroundColor: '#fde0dd',
                borderColor: '#fde0dd'
            }
        ]
    }

    rdt_Chart.config.data = rdt_data2
    rdt_Chart.update()

};


// Filter Data Function
function filterData2() {
    var prov_filter = document.getElementById("prov_filter");
    var kab_filter = document.getElementById("kab_filter");
    var kec_filter = document.getElementById("kec_filter");

    var prov_select = prov_filter.value;
    var kab_select = kab_filter.value;
    var kec_select = kec_filter.value;
    var start_date_select = start_date.value;
    var end_date_select = end_date.value;

    let start_date_filter = new Date(start_date_select)
    let end_date_filter = new Date(end_date_select)


    let dt_fltr2 = dt
        .filter(aq.escape(d => d.tanggal >= start_date_filter && d.tanggal <= end_date_filter))
        .filter(aq.escape(d => d.provinsi === prov_select))
        .filter(aq.escape(d => d.kabupaten === kab_select))
        .filter(aq.escape(d => d.kecamatan === kec_select))

    let visit = dt_fltr2
        .rollup({ all_visit: d => op.sum(d.kasus) })
        .get('all_visit', 0)


    let cum_case = dt_fltr2
        .filter(d => d.penyakit !== 'None')
        .rollup({ all_visit: d => op.sum(d.kasus) })
        .get('all_visit', 0)

    let week = dt_fltr2
        .rollup({ max_week: d => op.max(d.minggu) })
        .get('max_week', 0)

    var cum_case_dsp = document.getElementById("cum_case");
    var visit_dsp = document.getElementById("tot_vis");
    var week_dsp = document.getElementById("week");

    cum_case_dsp.innerHTML = cum_case;
    visit_dsp.innerHTML = visit;
    week_dsp.innerHTML = week;


    let data_1_2 = dt_fltr2
        .filter(d => d.penyakit !== 'None')
        .groupby('fasyankes')
        .rollup({ jumlah_kasus: d => op.sum(d.kasus) })
        .orderby(aq.desc('jumlah_kasus'));

    const cba_data2 = {
        labels: data_1_2.array('fasyankes'),
        datasets: [{
            label: 'Kasus',
            data: data_1_2.array('jumlah_kasus'),
            borderWidth: 1,

        }]
    };
    cba_Chart.config.data = cba_data2
    cba_Chart.update()

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
        .rollup({ jumlah_kasus: d => op.sum(d.kasus) })
        .join(color_p, ['penyakit', 'penyakit'])
        .orderby(aq.desc('jumlah_kasus'));

    const cdb_data2 = {
        labels: data_2_2.array('penyakit'),
        datasets: [{
            label: 'Kasus',
            data: data_2_2.array('jumlah_kasus'),
            backgroundColor: data_2_2.array('color'),
            borderColor: data_2_2.array('color'),
            borderWidth: 1,

        }]
    };

    cdb_Chart.config.data = cdb_data2
    cdb_Chart.update()

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
        .groupby('tahun_minggu', 'penyakit')
        .rollup({ jumlah_kasus: d => op.sum(d.kasus) })
        .orderby('tahun_minggu')

    const cdt_data2 = {
        labels: [... new Set(data_3_2.array('tahun_minggu'))],
        datasets: [
            {
                label: 'Diare Akut',
                data: data_3_2.filter(d => d.penyakit === 'Diare Akut').array('jumlah_kasus'),
                backgroundColor: '#9ebcda',
                borderColor: '#9ebcda'
            },
            {
                label: 'Malaria Konfirmasi',
                data: data_3_2.filter(d => d.penyakit === 'Malaria Konfirmasi').array('jumlah_kasus'),
                backgroundColor: '#fdbb84',
                borderColor: '#fdbb84'
            },
            {
                label: 'ILI (Penyakit Serupa Influenza)',
                data: data_3_2.filter(d => d.penyakit === 'ILI (Penyakit Serupa Influenza)').array('jumlah_kasus'),
                backgroundColor: '#a8ddb5',
                borderColor: '#a8ddb5'
            },
            {
                label: 'Suspek COVID-19',
                data: data_3_2.filter(d => d.penyakit === 'Suspek COVID-19').array('jumlah_kasus'),
                backgroundColor: '#2b8cbe',
                borderColor: '#2b8cbe'
            },
            {
                label: 'Pnemonia',
                data: data_3_2.filter(d => d.penyakit === 'Pnemonia').array('jumlah_kasus'),
                backgroundColor: '#a6bddb',
                borderColor: '#a6bddb'
            },
            {
                label: 'Diare Berdarah/ Disentri',
                data: data_3_2.filter(d => d.penyakit === 'Diare Berdarah/ Disentri').array('jumlah_kasus'),
                backgroundColor: '#8856a7',
                borderColor: '#8856a7'
            },
            {
                label: 'Suspek Demam Tifoid',
                data: data_3_2.filter(d => d.penyakit === 'Suspek Demam Tifoid').array('jumlah_kasus'),
                backgroundColor: '#c994c7',
                borderColor: '#c994c7'
            },
            {
                label: 'Sindrom Jaundice Akut',
                data: data_3_2.filter(d => d.penyakit === 'Sindrom Jaundice Akut').array('jumlah_kasus'),
                backgroundColor: '#ece2f0',
                borderColor: '#ece2f0'
            },
            {
                label: 'Suspek Chikungunya',
                data: data_3_2.filter(d => d.penyakit === 'Suspek Chikungunya').array('jumlah_kasus'),
                backgroundColor: '#c51b8a',
                borderColor: '#c51b8a'
            },
            {
                label: 'Suspek Meningitis/Encephalitis',
                data: data_3_2.filter(d => d.penyakit === 'Suspek Meningitis/Encephalitis').array('jumlah_kasus'),
                backgroundColor: '#7fcdbb',
                borderColor: '#7fcdbb'
            }
        ],
    };

    cdt_Chart.config.data = cdt_data2
    cdt_Chart.update()

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
        .rollup({ jumlah_kasus: d => op.sum(d.kasus) })
        .join(color_p, ['penyakit', 'penyakit'])
        .orderby(aq.desc('jumlah_kasus'));

    const rdb_data2 = {
        labels: data_4_2.array('penyakit'),
        datasets: [{
            label: 'Kasus',
            data: data_4_2.array('jumlah_kasus'),
            backgroundColor: data_4_2.array('color'),
            borderColor: data_4_2.array('color'),
            borderWidth: 1,

        }]
    };

    rdb_Chart.config.data = rdb_data2
    rdb_Chart.update()

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
        .groupby('tahun_minggu', 'penyakit')
        .rollup({ jumlah_kasus: d => op.sum(d.kasus) })
        .orderby('tahun_minggu');

    const rdt_data2 = {
        labels: [... new Set(data_5_2.array('tahun_minggu'))],
        datasets: [
            {
                label: 'Suspek HFMD',
                data: data_5_2.filter(d => d.penyakit === 'Suspek HFMD').array('jumlah_kasus'),
                backgroundColor: '#f7fcb9',
                borderColor: '#f7fcb9'
            },
            {
                label: 'Suspek Tetanus',
                data: data_5_2.filter(d => d.penyakit === 'Suspek Tetanus').array('jumlah_kasus'),
                backgroundColor: '#2ca25f',
                borderColor: '#2ca25f'
            },
            {
                label: 'Gigitan Hewan Penular Rabies',
                data: data_5_2.filter(d => d.penyakit === 'Gigitan Hewan Penular Rabies').array('jumlah_kasus'),
                backgroundColor: '#43a2ca',
                borderColor: '#43a2ca'
            },
            {
                label: 'Suspek Campak',
                data: data_5_2.filter(d => d.penyakit === 'Suspek Campak').array('jumlah_kasus'),
                backgroundColor: '#e34a33',
                borderColor: '#e34a33'
            },
            {
                label: 'Suspek Kolera',
                data: data_5_2.filter(d => d.penyakit === 'Suspek Kolera').array('jumlah_kasus'),
                backgroundColor: '#1c9099',
                borderColor: '#1c9099'
            },
            {
                label: 'Acute Flacid Paralysis (AFP)',
                data: data_5_2.filter(d => d.penyakit === 'Acute Flacid Paralysis (AFP)').array('jumlah_kasus'),
                backgroundColor: '#d95f0e',
                borderColor: '#d95f0e'
            },
            {
                label: 'Pertussis',
                data: data_5_2.filter(d => d.penyakit === 'Pertussis').array('jumlah_kasus'),
                backgroundColor: '#dd1c77',
                borderColor: '#dd1c77'
            },
            {
                label: 'Suspek Leptospirosis',
                data: data_5_2.filter(d => d.penyakit === 'Suspek Leptospirosis').array('jumlah_kasus'),
                backgroundColor: '#756bb1',
                borderColor: '#756bb1'
            },
            {
                label: 'Kluster Penyakit yang tidak lazim',
                data: data_5_2.filter(d => d.penyakit === 'Kluster Penyakit yang tidak lazim').array('jumlah_kasus'),
                backgroundColor: '#bdbdbd',
                borderColor: '#bdbdbd'
            },
            {
                label: 'Suspek Tetanus Neonatorum',
                data: data_5_2.filter(d => d.penyakit === 'Suspek Tetanus Neonatorum').array('jumlah_kasus'),
                backgroundColor: '#e5f5e0',
                borderColor: '#e5f5e0'
            },
            {
                label: 'Suspek Difteri',
                data: data_5_2.filter(d => d.penyakit === 'Suspek Difteri').array('jumlah_kasus'),
                backgroundColor: '#fde0dd',
                borderColor: '#fde0dd'
            }
        ]
    }

    rdt_Chart.config.data = rdt_data2
    rdt_Chart.update()

};
const table_heatmap = dt
                      .select('tanggal', 'provinsi', 'kabupaten', 'kasus')
                      .print();

// console.log('table heatmap', table_heatmap);



// Coba Filter Data Menggunakan Array

// var provinsi = ['ABIANSEMAL'];
// dt
// .params({
// kab:kab_array
// })
// .filter((d, $) => op.includes($.kab, d.kecamatan))
// .print()

const dtColumnKecamatan = dt.column('kecamatan')
const dtColumnTanggal = dt.column('tanggal')
const kecamatanSet = [...new Set(dtColumnKecamatan)]
console.log('kecamatan', kecamatanSet);


// visualisasi jumlah kasus penyakit di beberapa kecamatan per tanggal
// x = tanggal
// y = kecamatan
// isinya = total kasus

let data_10 = dt
    .filter(d => d.penyakit !== 'None')
    .groupby('kecamatan')
    .orderby('tanggal')


let data_11 = dt
    .filter(d => d.penyakit == 'ILI (Penyakit Serupa Influenza)')
    .groupby('tanggal', 'fasyankes')
    .orderby('tanggal');
    
console.log('data11', data_11);

// const heat_data = {
//     labels: data_10.array('penyakit'),
//     datasets: [{
//         label: 'Kasus',
//         data: data_10.array('jumlah_kasus'),
//         backgroundColor: data_10.array('color'),
//         borderColor: data_10.array('color'),
//         borderWidth: 1,

//     }]
// };

console.log('data_10', data_10)


///////
const heatchart = document.getElementById("heat_chart");
console.log(heatchart);
let heat_chart = new Chart(heatchart, {
    type: 'matrix',
    data: {
        labels: "Heatmap Disease",
        datasets: [
            {
                label: 'Penyakit: ILI (Penyakit Serupa Influenza)',
                data: [
                    { x: '26-12-2022', y: 'Abiansemal', v: 2 },
                    { x: '26-12-2022', y: 'Kuta', v: 0 },
                    { x: '26-12-2022', y: 'Kuta Selatan', v: 11 },
                    { x: '26-12-2022', y: 'Kuta Utara', v: 0 },
                    { x: '26-12-2022', y: 'Mengwi', v: 10 },
                    { x: '26-12-2022', y: 'Petang', v: 2 },
                    { x: '27-12-2022', y: 'Abiansemal', v: 1 },
                    { x: '27-12-2022', y: 'Kuta', v: 1 },
                    { x: '27-12-2022', y: 'Kuta Selatan', v: 3 },
                    { x: '27-12-2022', y: 'Kuta Utara', v: 0 },
                    { x: '27-12-2022', y: 'Mengwi', v: 1 },
                    { x: '27-12-2022', y: 'Petang', v: 1 },
                    { x: '28-12-2022', y: 'Abiansemal', v: 1 },
                    { x: '28-12-2022', y: 'Kuta', v: 0 },
                    { x: '28-12-2022', y: 'Kuta Selatan', v: 6 },
                    { x: '28-12-2022', y: 'Kuta Utara', v: 0 },
                    { x: '28-12-2022', y: 'Mengwi', v: 15 },
                    { x: '28-12-2022', y: 'Petang', v: 0 },
                    { x: '29-12-2022', y: 'Abiansemal', v: 2 },
                    { x: '29-12-2022', y: 'Kuta', v: 0 },
                    { x: '29-12-2022', y: 'Kuta Selatan', v: 10 },
                    { x: '29-12-2022', y: 'Kuta Utara', v: 11 },
                    { x: '29-12-2022', y: 'Mengwi', v: 0 },
                    { x: '29-12-2022', y: 'Petang', v: 1 },
                    { x: '30-12-2022', y: 'Abiansemal', v: 29 },
                    { x: '30-12-2022', y: 'Kuta', v: 0 },
                    { x: '30-12-2022', y: 'Kuta Selatan', v: 10 },
                    { x: '30-12-2022', y: 'Kuta Utara', v: 0 },
                    { x: '30-12-2022', y: 'Mengwi', v: 17 },
                    { x: '30-12-2022', y: 'Petang', v: 0 },
                    { x: '31-12-2022', y: 'Abiansemal', v: 31 },
                    { x: '31-12-2022', y: 'Kuta', v: 0 },
                    { x: '31-12-2022', y: 'Kuta Selatan', v: 2 },
                    { x: '31-12-2022', y: 'Kuta Utara', v: 0 },
                    { x: '31-12-2022', y: 'Mengwi', v: 16 },
                    { x: '31-12-2022', y: 'Petang', v: 0 }
                ],
                backgroundColor: function (ctx) {
                    var value = ctx.dataset.data[ctx.dataIndex].v;
                    // const max = Math.max(value);
                    // var hue = (value / max * 36) * 120;
                    var hue = (value / 36) * 120; // hue ranges from 0 to 120 degrees
                    return 'hsl(' + hue + ', 100%, 50%)';
                },
                borderColor: 'rgb(201, 242, 155)',
                // backgroundColor(c) {
                //     const value = c.dataset.data[c.dataIndex].v;
                //     const alpha = (value - 5) / 40;
                //     // return helpers.color('green').alpha(alpha).rgbString();
                //   },
                // borderColor(c) {
                //     const value = c.dataset.data[c.dataIndex].v;
                //     const alpha = (value - 5) / 40;
                //     // return helpers.color('darkgreen').alpha(alpha).rgbString();
                //   },
                borderWidth: 1,
                hoverBackgroundColor: 'rgb(201, 242, 155)',
                hoverBorderColor: 'rgb(195, 255, 104)',
                width: ({ chart }) => (chart.chartArea || {}).width / 6 - 1,
                height: ({ chart }) => (chart.chartArea || {}).height / 6 - 1
            }
        ]
    },
    options: {
        plugins: {
            legend: true,
            tooltip: {
                callbacks: {
                    // title: function(tooltipItems, data) {
                    //     return data.datasets[tooltipItems[0].datasetIndex].label + ", " + tooltipItems[0].xLabel;
                    // },
                    // label: function(tooltipItems, data) {
                    //     var vIndex = 31 - tooltipItems.datasetIndex;
                    //     if (vIndex > 30) {vIndex = 0}
                    //     return ['Tanggal: ' + vIndex.x, 'Kecamatan: ' + vIndex.y, 'Kasus: ' + vIndex.v];
                    // }
                    title() {
                        return '';
                    },
                    label(context) {
                        const v = context.dataset.data[context.dataIndex];
                        return ['Tanggal: ' + v.x, 'Kecamatan: ' + v.y, 'Kasus: ' + v.v];
                    }
                }
            }
        },
        scales: {
            x: {
                type: 'category',
                title: {
                    display: true,
                    font: { size: 15, weight: 'bold' },
                    text: 'Tanggal'
                },
                labels: ['26-12-2022', '27-12-2022', '28-12-2022', '29-12-2022', '30-12-2022', '31-12-2022'],
                ticks: {
                    display: true
                },
                grid: {
                    display: false
                }
            },
            y: {
                type: 'category',
                title: {
                    display: true,
                    font: { size: 15, weight: 'bold' },
                    text: 'Kecamatan'
                },
                labels: ['Abiansemal', 'Kuta', 'Kuta Selatan', 'Kuta Utara', 'Mengwi', 'Petang'],
                offset: true,
                ticks: {
                    display: true
                },
                grid: {
                    display: false
                }
            }
        }
    }
});


//leaflet js geomap
var map = L.map('basicmap').setView([-8.379,115.158], 13);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
        var geopoint = [];
        // const  data = [
        //     {
        //       "No": 1,
        //       "Nama Puskesmas": "ABIANSEMAL I",
        //       "Kode Puskesmas": 1050038,
        //       "Kecamatan": "ABIANSEMAL",
        //       "Kabupaten": "BADUNG",
        //       "Provinsi": "BALI",
        //       "Longitude": 115.1073,
        //       "Latitude": -8.6134
        //     },
        //     {
        //       "No": 2,
        //       "Nama Puskesmas": "ABIANSEMAL II",
        //       "Kode Puskesmas": 1050039,
        //       "Kecamatan": "ABIANSEMAL",
        //       "Kabupaten": "BADUNG",
        //       "Provinsi": "BALI",
        //       "Longitude": 115.1073,
        //       "Latitude": -8.613
        //     }]
        $.getJSON('csvjson.json', function(data) {
           $.each(data, function(i, f) {
              var tblRow = "<tr>" + "<td>" + f['Nama Puskesmas'] + "</td>" + "<td>" + f.Kecamatan + "</td>" + "<td>" + f.Kabupaten + "</td>" + "<td>" + f.Provinsi + "</td>" + "<td>" + f.Longitude + "</td>" +
               "<td>" + f.Latitude + "</td>" + "</tr>"
               $(tblRow).appendTo("#userdata");
               L.marker([parseFloat(`${f.Latitude}`),parseFloat(`${f.Longitude}`) ]).addTo(map).bindPopup(`Provinsi: ${f.Provinsi}` + "<br>" + `Kabupaten: ${f.Kabupaten}` + "<br>" + `Kecamatan: ${f.Kecamatan}` + "<br>" + `Fasyankes: ${f['Nama Puskesmas']}`).openPopup();
            });
        });
