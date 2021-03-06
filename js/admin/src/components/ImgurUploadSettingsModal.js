/*
* This file is part of imgur-upload.
*
* (c) Matteo Pompili <matpompili@gmail.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/
import SettingsModal from 'flarum/components/SettingsModal';

export default class ImageUploadSettingsModal extends SettingsModal {
  className() {
    return 'ImageUploadSettingsModal Modal--small';
  }

  title() {
    return 'Imgur Upload Settings';
  }

  form() {
    return [
      <div className="Form-group">
        <label>Imgur Client ID</label>
        <input className="FormControl" bidi={this.setting('matpompili.imgur-upload.clientID')}/>
      </div>
    ];
  }
}
