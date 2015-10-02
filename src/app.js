window.onload = function() {
    const API_ROOT = 'https://topillo.cartodb.com/api/v2';
    let firstYear = 1963;
    let lastYear = 2015;

    const renderStyles = function(data) {
        let i = 0;
        if (data.rows.length) {
            $('#country-name').html(data.rows[0].country);
            $('#mylist').html('');

            for (var styleRow of data.rows) {
                styleRow.cartodb_id = i++;
                renderStyleRow(styleRow);
            }

            $('#mylist li:first').addClass('style-selected');
            renderBands(data.rows[0]);
        }
    };
    const renderStyleRow = function(styleRow) {
        const tpl = `<li id="${styleRow.cartodb_id}">${styleRow.style}: <strong>${styleRow.count}</strong></li>\n`; 

        $('#mylist').append(tpl);
        $(`#${styleRow.cartodb_id}`).click(
            function checkStyle(event) {
                $('.style-selected').removeClass('style-selected');
                $(event.target).addClass('style-selected'); 
                renderBands(styleRow);
            }
        );
    };
    const renderBands = function(styleRow) {
        $('#bands-list').html('<li>Loading...</li>');
        const bandsQuery = `${API_ROOT}/sql?q=select * from bands_complex where country ilike '${styleRow.country}' and style like '${styleRow.style}' and formation_year between '01-01-${firstYear}' and '01-01-${lastYear}' order by metalarchives_id asc limit 10`;
        $.get(bandsQuery, function (bandsData) {
            $('#bands-list').html(_.map(bandsData.rows, renderBandRow).join("\n"));
        });
    };
    const renderBandRow = function(band) {
        const bandLink = `http://www.metal-archives.com/bands/${band.name.replace(' ', '_')}/${band.metalarchives_id}`
        return `<li><a href="${bandLink}" target="_blank">${band.name} (${band.city || 'Unknown'})</a></li>`
    };
    const getInfoWindowTemplate = function(country) {
        if (country.country) {
            const stylesQuery = `${API_ROOT}/sql?q=select style, country, count(1) from bands_complex where country like '${country.country}' and formation_year between '01-01-${firstYear}' and '01-01-${lastYear}' group by style, country order by count desc limit 10`
            $.get(stylesQuery, renderStyles);
        }
        return $('#infowindow_template').html();
    };
    const toggleFilterColumn = function() {
        $('#filter-column').animate({
            width:'toggle'
        }, 350, 'swing', function() {
             $('#filter-button .glyphicon').toggleClass('glyphicon-chevron-right glyphicon-chevron-left');
        });
    };
    const initializeApp = function(vis, layers) {
        const southWest = L.latLng(-90, -180);
        const northEast = L.latLng(90, 180);

        vis.map.set({
            minZoom:3,
            maxZoom:7
        }); 

        layers[0].leafletMap.setMaxBounds(L.latLngBounds(southWest, northEast))
        layers[1].getSubLayer(0).infowindow.set('template', getInfoWindowTemplate);

        $('#year-select').slider({
            orientation: 'vertical',
            min: 1963,
            max: 2015,
            values: [1963, 2015],
            step: 1,
            range: true
            })
            .on('slidechange', function() {
                [firstYear, lastYear] = $(this).slider('values'); 
                $('#start-year').html(firstYear);
                $('#end-year').html(lastYear);
                layers[1].getSubLayer(0).infowindow.set('template', getInfoWindowTemplate);
            });

        $('#filter-button').click(toggleFilterColumn);
    }

    cartodb.createVis('map', `${API_ROOT}/viz/65949fe8-60b3-11e5-8c64-0e73ffd62169/viz.json`, {
            fullscreen: false,
            legends: false,
            search: false,
            shareable: false
        })
        .done(initializeApp);
}
