# Parg

[![Greenkeeper badge](https://badges.greenkeeper.io/Qard/parg.svg)](https://greenkeeper.io/)
[![Build Status](https://travis-ci.org/Qard/parg.png)](https://travis-ci.org/Qard/parg)

Parg lets you parse arguments with ease

## Note

This project is experimental, so I'd recommend keeping an eye on which tests pass and which fail. For example; currently the selector `s:key s:values*` will not work, as the values splat is too greedy. I'll figure out a fix later.

## Install

    npm install parg

## Usage
    
    function register () {
      var opts = parg('s:email s:password s:username?', arguments)

      User.create({
        email: opts.email
        , password: opts.password
        , username: opts.username
      })
    }

    register('me@example.com', 'password')

## API

### var opts = parg(selector, arguments)
The simplest way to use parg is to use it inside a function to parse the arguments object

### parg.build(selector, function (err, opts) {})
You can also use it to wrap a function when it is created.

---

### Copyright (c) 2013 Stephen Belanger
#### Licensed under MIT License

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.