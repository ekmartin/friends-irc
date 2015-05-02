/*eslint-env mocha */
var chai = require('chai')
var rewire = require('rewire')
var irc = require('irc')
var sinon = require('sinon')
var ConfigurationError = require('../lib/errors').ConfigurationError
var validateChannelMapping = require('../lib/validators').validateChannelMapping
var Bot = rewire('../lib/bot')
var config = require('./fixtures/single-test-config.json')
var SwarmStub = require('./stubs/swarm-stub')
var ClientStub = require('./stubs/irc-client-stub')

chai.should()

describe('Channel Mapping', function () {
  before(function () {
    irc.Client = ClientStub
    Bot.__set__('createSwarm', SwarmStub)
    Bot.__set__('subleveldown', sinon.stub())
  })

  it('should fail when not given proper JSON', function () {
    var wrongMapping = 'not json'
    function wrap () {
      validateChannelMapping(wrongMapping)
    }
    (wrap).should.throw(ConfigurationError, /Invalid channel mapping given/)
  })

  it('should not fail if given a proper channel list as JSON', function () {
    var correctMapping = { '#channel': '#otherchannel' }
    function wrap () {
      validateChannelMapping(correctMapping)
    }
    (wrap).should.not.throw()
  })

  it('should clear channel keys from the mapping', function () {
    var bot = new Bot(sinon.stub(), config)
    bot.channelMapping['swarm'].should.equal('#irc')
    bot.invertedMapping['#irc'].should.equal('swarm')
    bot.channels[0].should.equal('#irc channelKey')
  })
})
