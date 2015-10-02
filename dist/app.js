(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

window.onload = function () {
    var API_ROOT = 'https://topillo.cartodb.com/api/v2';
    var firstYear = 1963;
    var lastYear = 2015;

    var renderStyles = function renderStyles(data) {
        var i = 0;
        if (data.rows.length) {
            $('#country-name').html(data.rows[0].country);
            $('#mylist').html('');

            var _iteratorNormalCompletion = true;
            var _didIteratorError = false;
            var _iteratorError = undefined;

            try {
                for (var _iterator = data.rows[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                    var styleRow = _step.value;

                    styleRow.cartodb_id = i++;
                    renderStyleRow(styleRow);
                }
            } catch (err) {
                _didIteratorError = true;
                _iteratorError = err;
            } finally {
                try {
                    if (!_iteratorNormalCompletion && _iterator['return']) {
                        _iterator['return']();
                    }
                } finally {
                    if (_didIteratorError) {
                        throw _iteratorError;
                    }
                }
            }

            $('#mylist li:first').addClass('style-selected');
            renderBands(data.rows[0]);
        }
    };
    var renderStyleRow = function renderStyleRow(styleRow) {
        var tpl = '<li id="' + styleRow.cartodb_id + '">' + styleRow.style + ': <strong>' + styleRow.count + '</strong></li>\n';

        $('#mylist').append(tpl);
        $('#' + styleRow.cartodb_id).click(function checkStyle(event) {
            $('.style-selected').removeClass('style-selected');
            $(event.target).addClass('style-selected');
            renderBands(styleRow);
        });
    };
    var renderBands = function renderBands(styleRow) {
        $('#bands-list').html('<li>Loading...</li>');
        var bandsQuery = API_ROOT + '/sql?q=select * from bands_complex where country ilike \'' + styleRow.country + '\' and style like \'' + styleRow.style + '\' and formation_year between \'01-01-' + firstYear + '\' and \'01-01-' + lastYear + '\' order by metalarchives_id asc limit 10';
        $.get(bandsQuery, function (bandsData) {
            $('#bands-list').html(_.map(bandsData.rows, renderBandRow).join("\n"));
        });
    };
    var renderBandRow = function renderBandRow(band) {
        var bandLink = 'http://www.metal-archives.com/bands/' + band.name.replace(' ', '_') + '/' + band.metalarchives_id;
        return '<li><a href="' + bandLink + '" target="_blank">' + band.name + ' (' + (band.city || 'Unknown') + ')</a></li>';
    };
    var getInfoWindowTemplate = function getInfoWindowTemplate(country) {
        if (country.country) {
            var stylesQuery = API_ROOT + '/sql?q=select style, country, count(1) from bands_complex where country like \'' + country.country + '\' and formation_year between \'01-01-' + firstYear + '\' and \'01-01-' + lastYear + '\' group by style, country order by count desc limit 10';
            $.get(stylesQuery, renderStyles);
        }
        return $('#infowindow_template').html();
    };
    var toggleFilterColumn = function toggleFilterColumn() {
        $('#filter-column').animate({
            width: 'toggle'
        }, 350, 'swing', function () {
            $('#filter-button .glyphicon').toggleClass('glyphicon-chevron-right glyphicon-chevron-left');
        });
    };
    var initializeApp = function initializeApp(vis, layers) {
        var southWest = L.latLng(-90, -180);
        var northEast = L.latLng(90, 180);

        vis.map.set({
            minZoom: 3,
            maxZoom: 7
        });

        layers[0].leafletMap.setMaxBounds(L.latLngBounds(southWest, northEast));
        layers[1].getSubLayer(0).infowindow.set('template', getInfoWindowTemplate);

        $('#year-select').slider({
            orientation: 'vertical',
            min: 1963,
            max: 2015,
            values: [1963, 2015],
            step: 1,
            range: true
        }).on('slidechange', function () {
            var _$$slider = $(this).slider('values');

            var _$$slider2 = _slicedToArray(_$$slider, 2);

            firstYear = _$$slider2[0];
            lastYear = _$$slider2[1];

            $('#start-year').html(firstYear);
            $('#end-year').html(lastYear);
            layers[1].getSubLayer(0).infowindow.set('template', getInfoWindowTemplate);
        });

        $('#filter-button').click(toggleFilterColumn);
    };

    cartodb.createVis('map', API_ROOT + '/viz/65949fe8-60b3-11e5-8c64-0e73ffd62169/viz.json', {
        fullscreen: false,
        legends: false,
        search: false,
        shareable: false
    }).done(initializeApp);
};

},{}]},{},[1]);

//# sourceMappingURL=app.js.map
