System.register('matpompili/imgur-upload/main', ['flarum/extend', 'flarum/components/TextEditor', 'flarum/components/Button'], function (_export) {
  /*
  * This file is part of imgur-upload.
  *
  * (c) Matteo Pompili <matpompili@gmail.com>
  *
  * For the full copyright and license information, please view the LICENSE
  * file that was distributed with this source code.
  */
  'use strict';

  var extend, TextEditor, Button;
  return {
    setters: [function (_flarumExtend) {
      extend = _flarumExtend.extend;
    }, function (_flarumComponentsTextEditor) {
      TextEditor = _flarumComponentsTextEditor['default'];
    }, function (_flarumComponentsButton) {
      Button = _flarumComponentsButton['default'];
    }],
    execute: function () {

      app.initializers.add('matpompili-imgur-upload', function () {
        /*
        * This add the Attach button and move the preview button, if it is
        * there, to the end of the button list
        */
        extend(TextEditor.prototype, 'controlItems', function (items) {
          //This add the localized Attach button
          items.add('imgur-upload', m(
            'div',
            { 'class': 'Button hasIcon imgur-upload-button' },
            m('i', { 'class': 'icon fa fa-fw fa-paperclip Button-icon' }),
            m(
              'span',
              { 'class': 'Button-label' },
              app.translator.trans('matpompili-imgur-upload.forum.attach')
            ),
            m('input', { type: 'file', accept: 'image/*', id: 'imgur-upload-input', name: 'imgur-upload-input' })
          ));
          //If we are editing a post, the preview method is defined
          if (this.props.preview) {
            //Remove preview button, and add it to the end (it just looks nicer)
            items.remove('preview');
            items.add('preview', Button.component({
              icon: 'eye',
              className: 'Button Button--icon',
              onclick: this.props.preview }));
          };
        });

        /*
        * This add a listner, with Jquery, to the Attach button. If a file is selected
        * it gets upload with Imgur API. If the upload is a succes it displays the
        * link in the Composer, otherwise it print the error to the console and shows
        * an error on the Attach button. In any case it gets prepared for a new upload
        */
        extend(TextEditor.prototype, 'init', function () {
          //Get the TextArea object and gives it a name, to be used inside the next function
          var textAreaObj = this;
          //Adds a listener for changes in the file input field
          $("#composer").on("change", "#imgur-upload-input", function () {
            var reader = new FileReader();
            reader.onload = function (e) {
              //This formats the file for base64 upload
              var data = e.target.result.substr(e.target.result.indexOf(",") + 1, e.target.result.length);
              //Get the elements with jQuery to act on them later
              var icon = $(".imgur-upload-button > i");
              var buttonText = $(".imgur-upload-button > span.Button-label");
              var submitButton = $(".item-submit > button");
              //Show a loading icon and a loading text
              icon.removeClass('fa-paperclip').addClass('fa-spin fa-circle-o-notch');
              buttonText.text(app.translator.trans('matpompili-imgur-upload.forum.loading')[0]);
              //Disable the submit button until the upload is completed
              submitButton.attr("disabled", true);
              //Actually upload the image
              $.ajax({
                url: 'https://api.imgur.com/3/image',
                headers: {
                  'Authorization': 'Client-ID ' + app.forum.attribute('imgurClientID')
                },
                type: 'POST',
                data: {
                  'image': data,
                  'type': 'base64'
                },
                success: function success(response) {
                  //Remove the loading icon and text, and show the success
                  icon.removeClass('fa-spin fa-circle-o-notch').addClass('fa-check green');
                  buttonText.text(app.translator.trans('matpompili-imgur-upload.forum.loaded')[0]);
                  //Get the link to the uploaded image and put https instead of http
                  var linkString = '\n![alt text](' + response.data.link.replace('http:\\\\', 'https:\\\\') + ')\n';
                  //Place the Markdown image link in the Composer
                  textAreaObj.insertAtCursor(linkString);
                  $("#imgur-upload-input").val("");
                  //If we are not starting a new discussion, the variable is defined
                  if (typeof textAreaObj.props.preview !== 'undefined') {
                    // Show what we just uploaded
                    textAreaObj.props.preview();
                  }
                  //After 1sec
                  setTimeout(function () {
                    //Enable the submit button
                    submitButton.attr("disabled", false);
                    //Restore the Attach button and text for a new upload
                    icon.removeClass('fa-check green').addClass('fa-paperclip');
                    buttonText.text(app.translator.trans('matpompili-imgur-upload.forum.attach')[0]);
                  }, 1000);
                }, error: function error(response) {
                  //Remove the loading icon and text, and show the error
                  icon.removeClass('fa-spin fa-circle-o-notch').addClass('fa-times red');
                  buttonText.text(app.translator.trans('matpompili-imgur-upload.forum.error')[0]);
                  //Output the error to the console, for debug purposes
                  console.log(response);
                  //After 1sec
                  setTimeout(function () {
                    //Enable the submit button
                    submitButton.attr("disabled", false);
                    //Restore the Attach button and text for a new upload
                    icon.removeClass('fa-times red').addClass('fa-paperclip');
                    buttonText.text(app.translator.trans('matpompili-imgur-upload.forum.attach')[0]);
                  }, 1000);
                }
              });
            };
            //Actually run everything on the file that's been selected
            reader.readAsDataURL($("#imgur-upload-input")[0].files[0]);
          });
        });
      });
    }
  };
});