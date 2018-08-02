var test = require('tape')
var time = require('./time')().def
var testErr = require('../testErr')

test('time module', function (t) {
  var terr = testErr(t, time);

  (async function () {
    var ctx = {}

    var now0 = await time.now(ctx, [])
    var now1 = await time.now(ctx, [
      {tz: 'Australia/Sydney'}
    ])
    t.ok(/^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d\d\dZ$/.test(now0))
    t.ok(/^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d\d\dZ$/.test(now1))

    await terr('now', ctx, [[]], 'TypeError: time:now was given [Array] instead of an opts map')

    t.equals(
      await time['new'](ctx, ['2010-08-08']),
      '2010-08-08T00:00:00.000Z',
      'Date only-defaults to 00:00'
    )

    t.equals(
      await time['new'](ctx, ['1967342']),
      '1967-12-08T00:00:00.000Z',
      'Year DayOfYear'
    )

    t.equals(
      await time['new'](ctx, [1967342]),
      '1967-12-08T00:00:00.000Z',
      'Year DayOfYear'
    )

    t.equals(
      await time['new'](ctx, ['2011W206T1345-0600']),
      '2011-05-21T19:45:00.000Z',
      'Year WeekOfYear DayOfWeek'
    )

    t.equals(
      await time['new'](ctx, ['083023Z']),
      (new Date()).toISOString().split('T')[0] + 'T08:30:23.000Z',
      'Time only-defaults to today'
    )

    await terr('new', ctx, [], 'Error: time:new needs a date string')
    await terr('new', ctx, [67342], 'TypeError: time:new was given 67342 instead of a date string')
    await terr('new', ctx, ['67342'], 'Error: time:new was given an invalid date string (67342)')

    t.equals(
      await time['add'](ctx, ['2017-01-01', {years: -2017}]),
      '0000-01-01T00:00:00.000Z'
    )
    t.equals(
      await time['add'](ctx, ['2017-01-01', {months: -22}]),
      '2015-03-01T00:00:00.000Z'
    )
    t.equals(
      await time['add'](ctx, ['2010-08-08', {weeks: 5}]),
      '2010-09-12T00:00:00.000Z'
    )
    t.equals(
      await time['add'](ctx, ['2010-08-08T05:00:00', {hours: 3}]),
      '2010-08-08T08:00:00.000Z'
    )
    t.equals(
      await time['add'](ctx, ['2017-01-01', {days: -10}]),
      '2016-12-22T00:00:00.000Z'
    )
    t.equals(
      await time['add'](ctx, ['2017-01-01', {minutes: 2, seconds: 90}]),
      '2017-01-01T00:03:30.000Z'
    )

    t.equals(
      await time['add'](ctx, [1967342, {'seconds': 'five'}]),
      '1967-12-08T00:00:00.000Z'
    )
    t.equals(
      await time['add'](ctx, [1967342, {'secondz': 5}]),
      '1967-12-08T00:00:00.000Z'
    )

    await terr('add', ctx, {'spec': {}}, 'Error: time:add needs a date string')
    await terr('add', ctx, [67342], 'Error: time:add needs a spec map')
    await terr('add', ctx, [67342, 5], 'TypeError: time:add was given 67342 instead of a date string')
    await terr('add', ctx, ['67342', 5], 'Error: time:add was given an invalid date string (67342)')
    await terr('add', ctx, ['2017-01-01', []], 'TypeError: time:add was given [Array] instead of a spec map')

    var xTime = '2010-10-06T18:25:55'
    t.equals(
      await time['strftime'](ctx, [xTime, '%F %T']),
      '2010-10-06 18:25:55'
    )
    t.equals(
      await time['strftime'](ctx, [xTime, '%A %d %b %Y']),
      'Wednesday 06 Oct 2010'
    )
    t.equals(
      await time['strftime'](ctx, [xTime, 'year month']),
      'year month'
    )

    await terr('strftime', ctx, [], 'Error: time:strftime needs a date string')
    await terr('strftime', ctx, [67342], 'Error: time:strftime needs a fmt string')
    await terr('strftime', ctx, [67342, '%F %T'], 'TypeError: time:strftime was given 67342 instead of a date string')
    await terr('strftime', ctx, ['67342', '%F %T'], 'Error: time:strftime was given an invalid date string (67342)')
    await terr('strftime', ctx, ['1967342', ['%A %d %b %Y']], 'TypeError: time:strftime was given [Array] instead of a fmt string')
  }()).then(t.end).catch(t.end)
})
