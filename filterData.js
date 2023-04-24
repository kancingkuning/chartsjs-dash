
var prov_select = prov_filter.value;
var kab_select  = kab_filter.value;
var kec_select  = kec_filter.value;
// var fks_select  = fks_filter.value;
var start_date_select  = start_date.value;
var end_date_select  = end_date.value;

let start_date_filter = new Date(start_date_select)
let end_date_filter = new Date(end_date_select)

// Filter Data Function
function filterData(){
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
                .filter(aq.escape(d =>  d.provinsi      === prov_select2))
                .filter(aq.escape(d =>  d.kabupaten     === kab_select2))
                .filter(aq.escape(d =>  d.kecamatan     === kec_select2))
    
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
            .rollup({jumlah_kasus: d => op.sum(d.kasus)})
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
            .rollup({jumlah_kasus: d => op.sum(d.kasus)})
            .join(color_p, ['penyakit', 'penyakit'])
            .orderby(aq.desc('jumlah_kasus'));

    const rdb_data2 = {
        labels: data_4_2.array('penyakit'),
        datasets: [{
            label: 'Kasus',
            data: data_4_2.array('jumlah_kasus'),
            backgroundColor:  data_4_2.array('color'),
            borderColor:  data_4_2.array('color'),
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

    rdt_Chart.config.data = rdt_data2
    rdt_Chart.update()

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
            .rollup({jumlah_kasus: d => op.sum(d.kasus)})
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
            .rollup({jumlah_kasus: d => op.sum(d.kasus)})
            .join(color_p, ['penyakit', 'penyakit'])
            .orderby(aq.desc('jumlah_kasus'));

    const rdb_data2 = {
        labels: data_4_2.array('penyakit'),
        datasets: [{
            label: 'Kasus',
            data: data_4_2.array('jumlah_kasus'),
            backgroundColor:  data_4_2.array('color'),
            borderColor:  data_4_2.array('color'),
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

    rdt_Chart.config.data = rdt_data2
    rdt_Chart.update()

};