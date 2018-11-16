/**
 * author: feifeiyu
 * Yupload is a image upload component base on form submit
 * @param url //image upload address
 * @param csrftoken  // csrftoken for POST Request
 * @param hideField // params submit with image
 * Yupload blog: https://feifeiyum.github.io/2016/12/24/yupload/
 */

var Yupload = function(opt, cb) {
    if(opt.url === undefined) {
        throw 'upload url can not be null'
    }
    if(opt.hideField && opt.hideField.constructor.toString().indexOf('Array') === -1) {
        throw 'type of hide field is array'
    }
    if(opt.csrftoken && typeof opt.csrftoken !== 'object') {
        throw 'type of csrftoken is object'
    }

    var self = this
    cb && (self.cb = cb)
    self.queue = []

    var uploadWrap = document.createElement('div')
    uploadWrap.id = 'yupload-wrap'
    uploadWrap.style.display = 'none'
    //fake iframe for form
    var fakeIframe = document.createElement('iframe')
    fakeIframe.id = 'yupload-iframe'
    fakeIframe.name = 'yupload-iframe'
    fakeIframe.style.display = 'none'
    uploadWrap.appendChild(fakeIframe)

    //form element
    self.form = document.createElement('form')
    self.form.target = 'yupload-iframe'
    self.form.id = 'yupload-form'
    self.form.method = 'POST'
    self.form.enctype = 'multipart/form-data'
    self.form.action = opt.url
    //insert csrftoken
    if(opt.csrftoken) {
        var csrfElem =  '<input type="hidden" name="' + opt.csrftoken.name + '" value="' + opt.csrftoken.value + '">'
        self.form.innerHTML = csrfElem
    }
    // hidden fields to submit
    self.fields = document.createElement('div')
    self.fields.id = 'yupload-fields'
    //render fields
    if(opt.hideField) {
        var hideElem = ''
        for(let i = 0; i < opt.hideField.length; i++) {
            hideElem += '<input type="hidden" name="' + opt.hideField[i].name + '" value="' + opt.hideField[i].value + '" id="">'
        }
        self.fields.innerHTML = hideElem
    }
    self.form.appendChild(self.fields)
    uploadWrap.appendChild(self.form)
    document.body.appendChild(uploadWrap)

    //get result
    fakeIframe.addEventListener('load', function() {
        var iframe = this
        var interFlag = null
        var loadData = function loadData() {
            if(!iframe.contentDocument.activeElement) {
                return false
            }
            clearInterval(interFlag)
            try {
                var data = JSON.parse(iframe.contentDocument.activeElement.childNodes[0].innerText)
                self.cb && self.cb(null, data)
            } catch(err) {
                self.cb && self.cb(err, null)
            }
            //clean queue
            self.queue.splice(0, 1)
            if(self.queue.length > 0) {
                self.upload()
            }
        }
        interFlag = setInterval(loadData, 500)
    })
}
//add request to queue
Yupload.prototype.trigger = function(opt, cb) {
    let self = this
    opt.cb = cb
    //push queue

    if(self.queue.length === 0) {
        // if it is not busy
        self.queue.push(opt)
        self.upload()
    } else {
        self.queue.push(opt)
    }
}
//operate upload
Yupload.prototype.upload = function() {
    var self = this
    var opt = self.queue[0]
    if(opt.url) {  //change post url
        self.form.action = opt.url
    }
    if(opt.hideField && opt.hideField.constructor.toString().indexOf('Array') === -1) {
        throw 'type of hide field is array'
    }
    opt.cb && (self.cb = opt.cb)
    //rerender fields
    if(opt.hideField) {
        var hideElem = ''
        for(let i = 0; i < opt.hideField.length; i++) {
            hideElem += '<input type="hidden" name="' + opt.hideField[i].name + '" value="' + opt.hideField[i].value + '">'
        }
        self.fields.innerHTML = hideElem
    }

    if(opt.target) {
        var inputFile = ''
        var cloneNode = ''
        //get input file element
        if(typeof opt.target === 'string') {
            inputFile = document.getElementById(opt.target)
        } else if(opt.target.constructor.toString().indexOf('HTMLInputElement') > -1) {
            inputFile = opt.target
        } else {
            throw 'type of file option is DOM(input) or input element\'s id and can not be null'
        }
        // clone and restore input element
        cloneNode = inputFile.cloneNode()
        cloneNode.value = null
        inputFile.parentNode.replaceChild(cloneNode, inputFile)
        //append input with selected file to form
        inputFile.id = 'uploading-file'
        self.fields.appendChild(inputFile)
        //submit
        self.form.submit()
    }
}

module.exports = Yupload
