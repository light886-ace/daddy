/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SettingsProvider } from './SettingsContext';
import { MusicProvider } from './MusicContext';
import { DiaryProvider } from './DiaryContext';
import { MainScreen } from './MainScreen';

export default function App() {
  return (
    <SettingsProvider>
      <MusicProvider>
        <DiaryProvider>
          <MainScreen />
        </DiaryProvider>
      </MusicProvider>
    </SettingsProvider>
  );
}
