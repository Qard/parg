var assert = require('assert')
  , Parg = require('../')

describe('parg', function () {
  var parg
  beforeEach(function () {
    parg = new Parg
  })

  it('should assign arguments', function () {
    parg(':name', ['foo'], true).should
      .have.property('name', 'foo')
  })

  it('should support builder', function () {
    parg.build('s:name', function (err, opts) {
      if (err) throw err
      opts.should.have.property('name', 'bar')
    })('bar')
  })

  describe('types', function () {
    it('should support boolean', function () {
      parg('b:bool', [true], true).should
        .have.property('bool', true)
      
      ;(function () { parg('b:bool', [1], true) }).should.throw()
    })

    it('should support regexp', function () {
      parg('r:regex', [/.*/], true).should
        .have.property('regex')
        .with.instanceof(RegExp)
        .and.property('source', /.*/.source)

      ;(function () { parg('r:regex', [1], true) }).should.throw()
    })

    it('should support strings', function () {
      parg('s:str', ['foo'], true).should
        .have.property('str', 'foo')

      ;(function () { parg('s:str', [1], true) }).should.throw()
    })

    it('should support numbers', function () {
      parg('n:num', [1], true).should
        .have.property('num', 1)

      ;(function () { parg('n:num', ['foo'], true) }).should.throw()
    })

    it('should support arrays', function () {
      parg('a:arr', [[1,2]], true).should
        .have.property('arr')
          .with.lengthOf(2)
          .and.eql([1, 2])

      ;(function () { parg('a:arr', ['foo'], true) }).should.throw()
    })

    it('should support objects', function () {
      parg('o:obj', [{ foo: 'bar' }], true).should
        .have.property('obj')
          .and.include({ foo: 'bar' })
 
      ;(function () { parg('o:obj', ['foo'], true) }).should.throw()
    })

    it('should support functions', function () {
      parg('f:func', [function () { return 'baz' }], true).should
        .have.property('func')
          .and.be.a('function')

      ;(function () { parg('o:obj', ['foo'], true) }).should.throw()
    })
  })

  describe('flags', function () {
    it('should support optional arguments', function () {
      (function () { parg('s:str?', [], true) }).should.not.throw()
      parg('s:str?', ['foo'], true).should
        .have.property('str', 'foo')
    })

    it('should support splat arguments', function () {
      parg('n:values*', [1, 2, 3], true).should
        .have.property('values')
          .and.a('object')
            .with.lengthOf(3)
            .and.eql([1,2,3])
    })

    it('should catch optional arguments after a splat', function () {
      parg('n:values* b:option?', [1, 2, 3], true).should
        .have.property('values')
          .and.a('object')
            .with.lengthOf(3)
            .and.eql([1,2,3])
      
      parg('n:values* b:option?', [1, 2, 3, true], true).should
        .have.property('option', true)
    })

    it('should catch optional arguments before a splat', function () {
      parg('b:option? n:values*', [1, 2, 3], true).should
        .have.property('values')
          .and.a('object')
            .with.lengthOf(3)
            .and.eql([1,2,3])

      parg('b:option? n:values*', [true, 1, 2, 3], true).should
        .have.property('option', true)
    })

    it('should catch optional arguments on both ends of a splat', function () {
      var opts = parg('b:before? n:values* b:after?', [true, 1, 2, 3, true], true)
      opts.should.have.property('values').with.lengthOf(3).and.eql([1,2,3])
      opts.should.have.property('before', true)
      opts.should.have.property('after', true)
    })

    it('should catch same-type values before a splat', function () {
      var opts = parg('s:key s:values*', ['foo','bar','baz'], true)
      opts.should.have.property('values').with.lengthOf(2).and.eql(['bar','baz'])
      opts.should.have.property('key', 'foo')
    })
  })
})