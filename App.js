/**
 * Sample React Native App with Firebase
 * https://github.com/invertase/react-native-firebase
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, ScrollView, Dimensions} from 'react-native';

import firebase from '@react-native-firebase/app';

// TODO(you): import any additional firebase services that you require for your app, e.g for auth:
//    1) install the npm package: `yarn add @react-native-firebase/auth@alpha` - you do not need to
//       run linking commands - this happens automatically at build time now
//    2) rebuild your app via `yarn run run:android` or `yarn run run:ios`
//    3) import the package here in your JavaScript code: `import '@react-native-firebase/auth';`
//    4) The Firebase Auth service is now available to use here: `firebase.auth().currentUser`

import storage from '@react-native-firebase/storage';

import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import {Appbar, DefaultTheme} from 'react-native-paper';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {WebView} from 'react-native-webview';
import Video from 'react-native-video';

const Tab = createMaterialBottomTabNavigator();
const colorPrimary = '#ff9933';

const MyTheme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#ff9933',
    },
};

const instructions = Platform.select({
    ios: 'Press Cmd+R to reload,\nCmd+D or shake for dev menu',
    android: 'Double tap R on your keyboard to reload,\nShake or press menu button for dev menu',
});

const firebaseCredentials = Platform.select({
    ios: 'https://invertase.link/firebase-ios',
    android: 'https://invertase.link/firebase-android',
});

type Props = {};

export default class App extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {
            videoUrl: ''
        };
        storage().ref('anim/Miksing_Logo-Animated.mp4').getDownloadURL()
            .then((url) => {
                this.updateVideoUrl(url);
            }, function (error) {
                console.log('Error: ' + error);
            }).catch(function(error) {
            console.log('Error: ' + error);
        });
    }

    updateVideoUrl = (value) => {
        this.setState({videoUrl: value}, console.log('Video url updated: ' + this.state.videoUrl));
    };

    render() {
        const {videoUrl} = this.state;
        return (
            <>
                <Toolbar/>
                <Video source={{uri: videoUrl}}
                       ref={(ref) => {
                           console.log("Video ref: " + ref)
                           if (ref !== null) this.player = ref; // Store reference
                       }}
                       onBuffer={this.onBuffer} // Callback when remote video is buffering
                       onError={this.videoError} // Callback when video cannot be loaded
                       repeat={true}
                       style={styles.backgroundVideo}/>
                <NavigationContainer theme={MyTheme}>
                    <Tab.Navigator
                        initialRouteName="Home"
                        activeColor="#330000"
                        shifting={true}
                        sceneAnimationEnabled={false}>
                        <Tab.Screen
                            name="Home"
                            component={HomeScreen}
                            options={{
                                tabBarLabel: 'Home',
                                tabBarIcon: ({color}) => (
                                    <MaterialIcons name="home" color={color} size={26}/>
                                ),
                            }}
                        />
                        <Tab.Screen
                            name="Settings"
                            component={SettingsScreen}
                            options={{
                                tabBarLabel: 'Settings',
                                tabBarIcon: ({color}) => (
                                    <MaterialIcons name="settings" color={color} size={26}/>
                                ),
                            }}
                        />
                    </Tab.Navigator>
                </NavigationContainer>
            </>
        );
    }
}

export class Toolbar extends React.Component {
    _goBack = () => console.log('Went back');
    _handleSearch = () => console.log('Searching');
    _handleMore = () => console.log('Shown more');

    render() {
        return (
            <Appbar.Header style={styles.navBar}>
                <Appbar.BackAction
                    onPress={this._goBack}
                />
                <Appbar.Content
                    title="Miksing"
                    subtitle="App dev demo"
                />
                <Appbar.Action icon="magnify" onPress={this._handleSearch}/>
                <Appbar.Action icon="dots-vertical" onPress={this._handleMore}/>
            </Appbar.Header>
        );
    }
}

function HomeScreen() {
    return (
        <ScrollView>
            {/* <WebView style={styles.webView} source={{ uri: 'https://reactnative.dev/' }} /> */}
            <View style={styles.container}>
                <Text style={styles.welcome}>Welcome to React Native + Firebase!</Text>
                <Text style={styles.instructions}>To get started, edit App.js</Text>
                <Text style={styles.instructions}>{instructions}</Text>
                {!firebase.apps.length && (
                    <Text style={styles.instructions}>
                        {`\nYou currently have no Firebase apps registered, this most likely means you've not downloaded your project credentials. Visit the link below to learn more. \n\n ${firebaseCredentials}`}
                    </Text>
                )}
            </View>
        </ScrollView>
    );
}

function SettingsScreen() {
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>Settings!</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
    navBar: {
        backgroundColor: colorPrimary,
    },
    webView: {
        height: 300,
    },
    backgroundVideo: {
        backgroundColor: colorPrimary,
        height: Dimensions.get('window').width * 9 / 16
    },
});
