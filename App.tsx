/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SettingsProvider } from './context/SettingsContext';
import { MusicProvider } from './context/MusicContext';
import { DiaryProvider } from './context/DiaryContext';
import { MainScreen } from './components/MainScreen';

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
