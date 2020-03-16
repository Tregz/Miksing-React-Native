import React, {Component} from 'react';
import {Platform, StyleSheet, Text, View, ScrollView, Dimensions} from 'react-native';
import {Appbar, DefaultTheme} from 'react-native-paper';
import Video from 'react-native-video'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';

import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';

const Tab = createMaterialBottomTabNavigator();
const colorPrimary = '#ff9933';
const Theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#ff9933',
    },
};

const instructions = Platform.select({
    ios: 'Come back later to enjoy\nthis iOS mixing app',
    android: 'Come back later to enjoy\nthis Android mixing app',
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
        console.log("User logged? " + (auth().currentUser !== null));
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
        this.setState({videoUrl: value}, console.log('Video url updated: ' + value));
    };

    render() {
        const {videoUrl} = this.state;
        return (
            <>
                <Toolbar/>
                <Video source={{uri: videoUrl}}
                       resizeMode={'contain'}
                       repeat={true}
                       style={styles.backgroundVideo}/>
                <NavigationContainer theme={Theme}>
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
                <Text style={styles.welcome}>Welcome to Miksing!</Text>
                <Text style={styles.instructions}>React native version</Text>
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
