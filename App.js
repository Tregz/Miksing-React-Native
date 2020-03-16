import React, {Component, useState, useEffect} from 'react';
import {Platform, StyleSheet, Text, View, ScrollView, Dimensions, FlatList, TouchableOpacity} from 'react-native';
import {Card} from 'react-native-elements';
import {Appbar, DefaultTheme} from 'react-native-paper';
import Video from 'react-native-video';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';

import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import storage from '@react-native-firebase/storage';
import WebView from 'react-native-webview';

const Tab = createMaterialBottomTabNavigator();
const colorPrimary = '#ff9933';
const defaultUser = 'Zdh2ZOt9AOMKih2cNv00XSwk3fh1';
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
            videoUrl: null,
        };
        // Firebase authentication
        console.log('User logged? ' + (auth().currentUser !== null));
    }

    componentDidMount(): void {
        // Firebase storage
        storage().ref('anim/Miksing_Logo-Animated.mp4').getDownloadURL()
            .then((url) => {
                this.updateVideoUrl(url);
            }, error => {
                console.log('Error: ' + error);
            }).catch(error => {
            console.log('Error: ' + error);
        });
        // Firebase database
        realtimeDatabase().catch(error => {
            console.log('Error: ' + error);
        });
    }

    updateVideoUrl = (value) => {
        this.setState({videoUrl: value}, console.log('Video url updated: ' + value));
    };

    render() {
        const {videoUrl} = this.state;
        // Same file for each platform, different folder
        const isAndroid = Platform.OS==='android';
        const androidWidgetYouTubePlayer = 'file:///android_asset/widget/youtube.html';
        const iOSWidgetYouTubePlayer = './external/widget/index.html';
        return (
            <>
                <Toolbar/>
                <Video source={videoUrl ? {uri: videoUrl} : null}
                       resizeMode={'contain'}
                       repeat={true}
                       style={styles.panoramic}/>
                <WebView
                    style={styles.panoramic}
                    originWhitelist={['*']}
                    allowFileAccess={true}
                    javaScriptEnabled={true}
                    source={{uri: isAndroid? androidWidgetYouTubePlayer: iOSWidgetYouTubePlayer}}
                    domStorageEnabled={true}
                    allowUniversalAccessFromFileURLs={true}
                    allowFileAccessFromFileURLs={true}
                    mixedContentMode="always"/>
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

async function realtimeDatabase() {
    await database().ref(`/user/${defaultUser}`).once('value');
}

function HomeScreen() {
    return (
        <>
            <ScrollView>
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
            {playlist(defaultUser)}
        </>
    );
}

function SettingsScreen() {
    return (
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text>Settings!</Text>
        </View>
    );
}

function playlist(uid) {
    const [loading, setLoading] = useState(true);
    const [songs, setSongs] = useState([]);
    const list = [];

    // Handle user snapshot response
    function onUserSnapshot(snapshot) {
        snapshot.forEach(song => {
            list.push({
                key: song.key, // Add custom key for FlatList usage
                ...song,
            });
            database().ref(`/song/${song.key}/`).once('value', onSongSnapshot);
        });
        setSongs(list);
        setLoading(false);
    }

    // Handle song snapshot response
    function onSongSnapshot(snapshot) {
        const song = list.find(x => x.key === snapshot.key);
        if (song !== undefined) {
            song.name = snapshot.val().name;
            song.mark = snapshot.val().mark;
        }
    }

    useEffect(() => {
        database().ref(`/user/${uid}/song/`).once('value', onUserSnapshot);
    }, [uid]);

    if (loading) {
        return <Text>Loading songs...</Text>;
    }

    function onItemClicked(id) {
        console.log("Clicked: " + id)
    }

    return <FlatList data={songs} renderItem={({ item }) =>
        <>
            <Card>
                <TouchableOpacity onPress={(e) => onItemClicked(item.key)}>
                    <Text>{item.name}</Text>
                    <Text style={{fontWeight: 'bold'}}>{item.mark}</Text>
                </TouchableOpacity>
            </Card>
        </>
    } />;
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
    panoramic: {
        backgroundColor: colorPrimary,
        flex: 1,
        height: Dimensions.get('window').width * 9 / 16
    },
});
