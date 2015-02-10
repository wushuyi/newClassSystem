/**
 * Created by shuyi.wu on 2015/2/5.
 */
requirejs.config({
    urlArgs: 'buts=' + (new Date()).getTime(),
    baseUrl: 'assets',
    paths: {
        apps: 'js/apps',
        base64: 'libs/base64/0.3.0/base64',
        dustHelpers: 'libs/dustjs-helpers/1.5.0/dust-helpers',
        dust: 'libs/dustjs-linkedin/2.5.1/dust-full',

        jquery: 'libs/jquery/1.11.2/jquery',
        jqueryRaty: 'libs/jquery.raty/2.7.0/jquery.raty',
        jqueryMousewheel: 'libs/jquery-mousewheel/3.1.12/jquery.mousewheel',

        jScrollPane: 'libs/jScrollPane/2.0.20/jquery.jscrollpane',
        localforage: 'libs/localforage/1.2.2/localforage',
        lodashJs: 'libs/lodash.js/2.4.1/lodash',
        magnificPopupJs: 'libs/magnific-popup.js/1.0.0/jquery.magnific-popup',
        modernizr: 'libs/modernizr/2.8.3/modernizr',
        requireDomReady: 'libs/require-modReady/2.0.1/domReady',
        socketIo: 'libs/socket.io/1.3.2/socket.io',
        sweetalert: 'libs/sweetalert/0.4.1/sweet-alert',
        umeditorHf: 'libs/umeditor-hf/1.2.2/umeditor',
        umeditorHfConfig: 'libs/umeditor-hf/1.2.2/umeditor.config',

        WSY: 'js/apps/util/wsy/core',
        wsy: 'js/apps/util/wsy',
        DetectRTC: 'js/apps/util/DetectRTC',
        RTCPeerConnection: 'js/apps/util/RTCPeerConnection-v1.5',
        loadImageAll: 'js/apps/util/load-image-all'
    },
    shim: {
        modernizr: {
            exports: 'Modernizr'
        },
        jqueryRaty: {
            deps: ['jquery']
        },
        jScrollPane: {
            deps: [
                'jqueryMousewheel',
                'jquery'
            ]
        },
        umeditorHf: {
            exports: 'UM',
            deps: ['umeditorHfConfig']
        },
        sweetalert: {
            exports: '-'
        },
        loadImageAll: {
            exports: '-',
            deps: ['jquery']
        },
        dust: {
            exports: 'dust'
        },
        RTCPeerConnection: {
            exports: '-'
        },
        DetectRTC: {
            exports: '-'
        }
    }
});