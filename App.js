import React, { useRef, useState, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, BackHandler, Dimensions } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height'; // status bar 높이

const WEBVIEW_URL = "/url 작성/";
const { width: SCREEN_WIDTH } = Dimensions.get("window"); // 화면 크기 알아내도록, width를 screen_width로 사용

export default function App() {
  const webViewRef = useRef();
  const [backButtonEnabled, setBackButtonEnabled] = useState(false);

  const webViewLoaded = () => setBackButtonEnabled(true); // 페이지가 로드되었으므로 변수 true로 설정
  const onNavigationStateChange = (navState) => setBackButtonEnabled(navState.canGoBack); // 뒤로 갈 수 있는지 확인

  const onPressHardwareBackButton = () => {
    if (!webViewRef.current) return;
    else {
      if (!backButtonEnabled) {
        BackHandler.exitApp(); // app 종료(뒤로갈 창이 없음)
        return;
      }
      webViewRef.current.goBack(); // 웹페이지 뒤로가기
      return true;
    }
  };

  useEffect(() => { // 웹페이지 뒤로가기 구현
    BackHandler.addEventListener('hardwareBackPress', onPressHardwareBackButton);
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', onPressHardwareBackButton);
    };
  }, [backButtonEnabled]);

  return (
    <>
      <StatusBar style="auto" />
      <WebView style={styles.view} source={{ uri: WEBVIEW_URL }} ref={webViewRef} javaScriptEnabled domStorageEnabled textZoom={100}
        onLoad={webViewLoaded} onNavigationStateChange={onNavigationStateChange} />
      {/* javascript 사용, 저장소 사용, textzoom값을 지정하여 시스템 각각 다 다른 사이즈 방지 */}
      {/* onload는 페이지 로드될 경우, onNavigationstatechange는 주소 이동할 때 */}
    </>
  );
}

const styles = StyleSheet.create({
  view: {
    width: SCREEN_WIDTH,
    marginTop: getStatusBarHeight() // statusbar 높이만큼 marginTop 주기
  }
});
