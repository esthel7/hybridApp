import React, { useRef, useState, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, BackHandler, Dimensions } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height'; // status bar 높이

const WEBVIEW_URL = "https://kiin.odoc-api.com/";
const { width: SCREEN_WIDTH } = Dimensions.get("window"); // 화면 크기 알아내도록, width를 screen_width로 사용

export default function App() {
  const webViewRef = useRef();
  const [currentUrl, setCurrentUrl] = useState('');

  const injectedJS = `
  (function() {
    function wrap(fn) {
      return function wrapper() {
        var res = fn.apply(this, arguments);
        window.ReactNativeWebView.postMessage('navigationStateChange');
        return res;
      }
    }

    history.pushState = wrap(history.pushState);
    history.replaceState = wrap(history.replaceState);
    window.addEventListener('popstate', function() {
      window.ReactNativeWebView.postMessage('navigationStateChange');
    });
  })();
  true;`;
  // post message로 메시지 보내기, 마지막에 true;넣어서 오류 방지

  const message = ({ nativeEvent: state }) => {
    if (state.data === 'navigationStateChange') {
      setCurrentUrl(state.url);
    }
  };

  const onPressHardwareBackButton = () => {
    if (!webViewRef.current) return;
    if (currentUrl === 'https://kiin.odoc-api.com/' || currentUrl === 'https://kiin.odoc-api.com/login' || currentUrl === 'https://kiin.odoc-api.com/main') {
      BackHandler.exitApp(); // app 종료
      return;
    }
    else {
      webViewRef.current.goBack(); // 웹페이지 뒤로가기
      return true;
    }
  };

  useEffect(() => { // 웹페이지 뒤로가기 구현
    BackHandler.addEventListener('hardwareBackPress', onPressHardwareBackButton);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onPressHardwareBackButton);
    };
  }, [currentUrl]);

  return (
    <>
      <StatusBar style="auto" />
      <WebView style={styles.view} source={{ uri: WEBVIEW_URL }} ref={webViewRef} javaScriptEnabled domStorageEnabled textZoom={100}
        injectedJavaScript={injectedJS} onMessage={message} />
      {/* javascript 사용, 저장소 사용, textzoom값을 지정하여 시스템 각각 다 다른 사이즈 방지 */}
      {/* injectedJavaScript는 webview 실행 전 먼저 실행 */}
    </>
  );
}

const styles = StyleSheet.create({
  view: {
    width: SCREEN_WIDTH,
    marginTop: getStatusBarHeight() // statusbar 높이만큼 marginTop 주기
  }
});
