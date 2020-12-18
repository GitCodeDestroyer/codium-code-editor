var main = 1,
    wordWrap = 1,
    indentSize = 2,
    inDisplayLang = 1,
    inputLayout = 1,
    terminalView = 1;

$(document).ready(function() {
    $(document).keydown(cursorPlace());

    $('.close-screen .loader').animate({
        bottom: '-7vh'
    }, 300);

    setTimeout(function() {
        $('.close-screen h6').text('Готово!');
        $('.close-screen').animate({
            top: '-100%'
        }, 800);
    }, 800);

    setTimeout(function() {
        $('.close-screen').css({
            'display': 'none'
        });
    }, 2300);
    window.sandbox = new Sandbox.View({
        el: $('#sandbox'),
        model: new Sandbox.Model()
    });
    $('#sandbox .output').niceScroll({
        mousescrollstep: 5,
        cursorcolor: "#F2F3F5",
        cursorwidth: "5px",
        cursorborderradius: "50px",
        cursorborder: "none",
        zindex: 10000,
        cursoropacitymin: 1,
        background: "#15171F"
        // horizrailenabled: false
    });
    $('.files-editor .tabs').sortable({
        opacity: 1,
        distance: 0,
        axis: "x",
        containment: "parent",
        placeholder: 'ui-state-highlight',
        scroll: true
    });

    function htmlEditorView() {
        $('.CodeMirror').css({
            'display': 'none'
        });
        $('.html .CodeMirror').css({
            'display': 'block'
        });
        $('.files-editor .tab').removeClass('active');
        $('.files-editor .tab-html').addClass('active');
        inDisplayLang = 1;
    }

    function cssEditorView() {
        $('.CodeMirror').css({
            'display': 'none'
        });
        $('.css .CodeMirror').css({
            'display': 'block'
        });
        $('.files-editor .tab').removeClass('active');
        $('.files-editor .tab-css').addClass('active');
        inDisplayLang = 2;
    }

    function jsEditorView() {
        $('.CodeMirror').css({
            'display': 'none'
        });
        $('.js .CodeMirror').css({
            'display': 'block'
        });
        $('.files-editor .tab').removeClass('active');
        $('.files-editor .tab-js').addClass('active');
        inDisplayLang = 3;
    }

    $('.files-editor .tab-html').click(function() {
        htmlEditorView();
    });
    $('.files-editor .tab-css').click(function() {
        cssEditorView();
    });
    $('.files-editor .tab-js').click(function() {
        jsEditorView();
    });



    $('.word-wrap').click(function() {
        if (wordWrap == 1) {
            $('.word-wrap .wrap-value').text('выкл.');
            htmlEditor.setOption('lineWrapping', false);
            cssEditor.setOption('lineWrapping', false);
            jsEditor.setOption('lineWrapping', false);
            wordWrap = 0;
        } else if (wordWrap == 0) {
            $('.word-wrap .wrap-value').text('вкл.');
            htmlEditor.setOption('lineWrapping', true);
            cssEditor.setOption('lineWrapping', true);
            jsEditor.setOption('lineWrapping', true);
            wordWrap = 1;
        }
    });

    $('.indent-size input').change(function() {
        var size = $(this)[0].value;
        if (size > 4) {
            if (inDisplayLang == 1) {
                htmlEditor.setOption("tabSize", 4);
            } else if (inDisplayLang == 2) {
                cssEditor.setOption("tabSize", 4);
            } else {
                jsEditor.setOption("tabSize", 4);
            }
        } else if (size < 1) {
            if (inDisplayLang == 1) {
                htmlEditor.setOption("tabSize", 1);
            } else if (inDisplayLang == 2) {
                cssEditor.setOption("tabSize", 1);
            } else {
                jsEditor.setOption("tabSize", 1);
            }
        } else {
            if (inDisplayLang == 1) {
                htmlEditor.setOption("tabSize", size);
            } else if (inDisplayLang == 2) {
                cssEditor.setOption("tabSize", size);
            } else {
                jsEditor.setOption("tabSize", size);
            }
        }
    });

    function cursorPlace() {
        if (inDisplayLang == 1) {
            $('.cursor-place .line')[0].innerHTML = htmlEditor.getCursor().line + 1;
            $('.cursor-place .ch')[0].innerHTML = htmlEditor.getCursor().ch + 1;
        } else if (inDisplayLang == 2) {
            $('.cursor-place .line')[0].innerHTML = cssEditor.getCursor().line + 1;
            $('.cursor-place .ch')[0].innerHTML = cssEditor.getCursor().ch + 1;
        } else {
            $('.cursor-place .line')[0].innerHTML = jsEditor.getCursor().line + 1;
            $('.cursor-place .ch')[0].innerHTML = jsEditor.getCursor().ch + 1;
        }
    }

    $('.CodeMirror').click(cursorPlace);

    $(window).bind('keydown', function(e) {
        if (e.ctrlKey && e.keyCode == 66) {
            if (inDisplayLang == 1) {
                beautify(htmlEditor, $('#html-code'));
            } else if (inDisplayLang == 2) {
                beautify(cssEditor, $('#css-code'));
            } else {
                beautify(jsEditor, $('#js-code'));
            }
        }
    });

    $('.nav .beatify-btn').click(function() {
        if (inDisplayLang == 1) {
            beautify(htmlEditor, $('#html-code'));
        } else if (inDisplayLang == 2) {
            beautify(cssEditor, $('#css-code'));
        } else {
            beautify(jsEditor, $('#js-code'));
        }
    });

    $('.save-btn').click(function() {

    });

    $('.terminal').resizable({
        handles: "n",
        maxHeight: 300,
        minHeight: 70
    });

    $('.editor-settings .terminal-icon').click(function() {
        var terminalHeight = $('.terminal').height();
        if (terminalView == 1) {
            $('.terminal').css({
                'display': 'none'
            });
            terminalView = 0;
        } else {
            $('.terminal').css({
                'display': 'block'
            });
            terminalView = 1;
        }
    });
    $(document).keydown(function(e) {
        if (e.ctrlKey && e.keyCode == 192) {
            var terminalHeight = $('.terminal').height();
            if (terminalView == 1) {
                $('.terminal').css({
                    'display': 'none'
                });
                terminalView = 0;
            } else {
                $('.terminal').css({
                    'display': 'block'
                });
                terminalView = 1;
            }
        }
    });
});