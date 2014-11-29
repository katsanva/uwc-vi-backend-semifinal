/**
 * Created by katsanva on 02.10.2014.
 */

var progressBar = $('<div/>', {
    class: 'progress'
}).append(
    $('<div/>', {
        class: 'progress-bar progress-bar-striped active',
        style: 'width:100%',
        role: 'progressbar',
        'aria-valuenow': 100,
        'aria-valuemin': 0,
        'aria-valuemax': 100
    })
);

function renderAlert(level, text) {
    $('.alert').remove();

    $('.view').append($('<div/>', {
        class: 'alert alert-' + level,
        html: text || 'На жаль не можна відобразити дані, спробуйте пізніше.'
    })).
        animate({
            width: 'toggle',
            height: 'toggle'
        });
}

$(document).ready(function() {
    $.ajax(
        {
            method: 'GET',
            timeout: 30000,
            beforeSend: function() {
                $('.view').before(progressBar);
            },
            url: '/currency/',
            complete: function() {
                progressBar.remove();
            },
            error: function(xhr, status) {
                if (status === 'timeout') {
                    return renderAlert('danger', 'Упс, таймаут.');
                }

                renderAlert('danger', xhr.responseText);
            },
            success: function(data) {
                var names = {
                    bankCurrencyCashlessKey: 'Готівковий курс Приватбанку',
                    bankCurrencyKey: 'Безготівковий курс Приватбанку',
                    officialCurrencyKey: 'Курс НБУ'
                };
                var newData = {};
                var container;
                for (var k in data[0]) {
                    newData[k] = [];

                    switch (k) {
                        case 'officialCurrencyKey':
                            for (var i = 0; i < data[0][k]['exchangerate']['exchangerate'].length; i++) {
                                newData[k][i] = (data[0][k]['exchangerate']['exchangerate'][i]['$'])
                            }
                            break;
                        default:
                            for (var i = 0; i < data[0][k]['exchangerates']['row'].length; i++) {
                                newData[k][i] = (data[0][k]['exchangerates']['row'][i]['exchangerate'][0]['$']
                                )
                            }
                    }


                }
                console.log(newData);

                for (var t in newData) {
                    container = $('<div/>', {html: names[t]});
                    for (i = 0; i < newData[t].length; i++) {
                        container.append($('<div/>', {
                                html: newData[t][i]['ccy'] + ':' + newData[t][i]['buy'] +
                                (newData[t][i]['unit'] ? ('/' + newData[t][i]['unit']) : '')
                            }
                        ))
                    }

                    $('.view').append(container);
                    $('.view').show()

                }
            }
        }
    );


});

$(document).on('click', '#departments_submit', function() {
    $.ajax(
        {
            method: 'POST',
            timeout: 30000,
            beforeSend: function() {
                $('.view').before(progressBar);
            },
            url: '/departments/',
            contentType: "application/json",
            data: JSON.stringify({
                address: $('#departments_address').val(),
                city: $('#departments_city').val()
            }),
            complete: function() {
                progressBar.remove();
            },
            error: function(xhr, status) {
                if (status === 'timeout') {
                    return renderAlert('danger', 'Упс, таймаут.');
                }

                renderAlert('danger', xhr.responseText);
            },
            success: function(data) {
                var view = $('.departments_view');

                if (!view.length) {
                    view = $('<div/>', {class: 'row'});
                    $('#departments_form').after(view);
                }

                view.html('');

                if (data['account_order']['pboffice'].length) {
                    try {
                        var offices = data['account_order']['pboffice'][0]['pboffice'];
                        for (var k in offices) {
                            view.append($('<div/>', {
                                class: 'col-md-2 col-xs-6',
                                html: '<strong>address</strong> ' + offices[k]['$']['country'] + ' ' + offices[k]['$']['city'] + ' ' + offices[k]['$']['address'] + '<br/>' +
                                '<strong>name</strong> ' + offices[k]['$']['name'] + '<br/>' +
                                '<strong>phone</strong> ' + offices[k]['$']['phone'] + '<br/>' +
                                (offices[k]['$']['email'] ? ('<strong>email</strong> ' + offices[k]['$']['email'] + '<br/>') : '')

                            }))
                        }
                    } catch (e) {
                        renderAlert('danger', 'На жаль маємо погані дані.')
                    }
                } else {
                    renderAlert('danger', 'Спробуйте запит іншою мовою')
                }

            }
        }
    );
});

$(document).on('click', '#partners_submit', function() {
    $.ajax(
        {
            method: 'POST',
            timeout: 30000,
            beforeSend: function() {
                $('.view').before(progressBar);
            },
            url: '/partners/',
            contentType: "application/json",
            data: JSON.stringify({
                address: $('#partners_address').val(),
                city: $('#partners_city').val()
            }),
            complete: function() {
                progressBar.remove();
            },
            error: function(xhr, status) {
                if (status === 'timeout') {
                    return renderAlert('danger', 'Упс, таймаут.');
                }

                renderAlert('danger', xhr.responseText);
            },
            success: function(data) {
                console.log(data);

                var view = $('.departments_view');

                if (!view.length) {
                    view = $('<div/>', {class: 'row'});
                    $('#departments_form').after(view);
                }

                view.html('');

                if (data['account_order']['bonus'].length) {

                    try {
                        var bonuses = data['account_order']['bonus'][0]['bonus'];
                        for (var k in bonuses) {
                            view.append($('<div/>', {
                                class: 'col-md-2 col-xs-6',
                                html: '<strong>name</strong> ' + bonuses[k]['$']['name'] + '<br/>' +
                                '<strong>address</strong> ' + bonuses[k]['$']['address'] + '<br/>' +
                                '<strong>bonus</strong> ' + bonuses[k]['$']['bonus_plus'] + '<br/>' +
                                '<strong>type</strong> ' + bonuses[k]['$']['type'] + '<br/>'

                            }))
                        }
                    } catch (e) {
                        renderAlert('danger', 'На жаль маємо погані дані.')
                    }
                } else {
                    renderAlert('danger', 'Спробуйте запит іншою мовою')
                }
            }
        }
    );
});
