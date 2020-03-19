import React, {Component, useState} from 'react';
import {Platform, StyleSheet, Text, View, ScrollView, Dimensions} from 'react-native';
import {Appbar, DefaultTheme, Searchbar} from 'react-native-paper';
import Video from 'react-native-video';
import WebView from 'react-native-webview';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';

import auth from '@react-native-firebase/auth';
import storage from '@react-native-firebase/storage';

import iOSWidgetYouTubePlayer from './resources/youtube.html';
import HomeScreen from './screens/HomeScreen';

const Tab = createMaterialBottomTabNavigator();
const colorPrimary = '#ff9933';
const instructions = Platform.select({
    ios: 'Come back later to enjoy\nthis iOS mixing app',
    android: 'Come back later to enjoy\nthis Android mixing app',
});
const Theme = {
    ...DefaultTheme,
    colors: {
        ...DefaultTheme.colors,
        primary: '#ff9933',
    },
};

type Props = {
    onSearchQuery: (searchText: string) => void
}

export default class App extends Component<Props> {
    constructor(props) {
        super(props);
        this.state = {
            searchText: '',
            videoStyle: styles.panoramic,
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
    }

    onSearchQuery = (searchText) => {
        this.setState({searchText: searchText});
    };

    onVideoSelected = (value) => {
        this.setState({videoStyle: styles.hide});
        this.webRef.injectJavaScript('loadVideoById(\'' + value + '\');');
    };

    updateVideoUrl = (value) => {
        this.setState({videoUrl: value}, console.log('Video url updated: ' + value));
    };

    SettingsScreen() {
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <ScrollView>
                    <View style={styles.container}>
                        <Text style={styles.welcome}>Welcome to Miksing!</Text>
                        <Text style={styles.instructions}>React native version</Text>
                        <Text style={styles.instructions}>{instructions}</Text>
                    </View>
                </ScrollView>
            </View>
        );
    }

    render() {
        const {videoStyle, videoUrl} = this.state;
        // Same file for each platform, different folder
        const isAndroid = Platform.OS === 'android';
        const androidWidgetYouTubePlayer = 'file:///android_asset/widget/youtube.html';

        return (
            <NavigationContainer theme={Theme}>
                <Toolbar onSearchQuery={this.onSearchQuery}/>
                <View>
                    <WebView
                        ref={r => (this.webRef = r)}
                        source={isAndroid ? {uri: androidWidgetYouTubePlayer} : iOSWidgetYouTubePlayer}
                        mediaPlaybackRequiresUserAction={false}
                        javaScriptEnabled={true}
                        style={styles.panoramic}
                        containerStyle={styles.panoramic}/>
                    <View style={styles.overLay}>
                        <Video
                            repeat={true}
                            resizeMode={'contain'}
                            source={videoUrl ? {uri: videoUrl} : null}
                            style={videoStyle}>
                        </Video>
                    </View>
                </View>
                <Tab.Navigator
                    initialRouteName="Home"
                    activeColor="#330000"
                    shifting={true}
                    sceneAnimationEnabled={false}>
                    <Tab.Screen
                        name="Home"
                        options={{
                            tabBarLabel: 'Home',
                            tabBarIcon: ({color}) => (
                                <MaterialIcons name="home" color={color} size={26}/>
                            ),
                        }}>
                        {props => <HomeScreen
                            {...props}
                            onVideoSelected={this.onVideoSelected}
                            searchText={this.state.searchText}/>}
                    </Tab.Screen>
                    <Tab.Screen
                        name="Settings"
                        screenState
                        component={this.SettingsScreen}
                        options={{
                            tabBarLabel: 'Settings',
                            tabBarIcon: ({color}) => (
                                <MaterialIcons name="settings" color={color} size={26}/>
                            ),
                        }}
                    />
                </Tab.Navigator>
            </NavigationContainer>
        );
    }
}

const Toolbar = ({onSearchQuery}: Props) => {
    const [searchText, setSearchText] = useState([]);
    const [searchStyle, setSearchStyle] = useState(styles.hide);

    const goBack = () => console.log('Went back');
    //const handleMore = () => console.log('Shown more');
    const handleSearch = () => setSearchStyle(null);
    const onSearchIconPress = () => {
        setSearchStyle(styles.hide);
        setSearchText('');
    };

    return (
        <Appbar.Header style={styles.navBar}>
            <Searchbar
                icon={() => <MaterialIcons name="arrow-back" color={'#000'} size={26}/>}
                onChangeText={onSearchQuery}
                onIconPress={onSearchIconPress}
                placeholder="Search"
                style={searchStyle}
                value={searchText}/>
            <Appbar.BackAction onPress={goBack} style={styles.hide}/>
            <Appbar.Content title="Miksing" subtitle="App dev demo"/>
            <Appbar.Action icon="magnify" onPress={handleSearch}/>
            {/*<Appbar.Action icon="dots-vertical" onPress={handleMore}/>*/}
        </Appbar.Header>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    hide: {
        display: 'none',
    },
    instructions: {
        textAlign: 'center',
        color: '#333333',
        marginBottom: 5,
    },
    navBar: {
        backgroundColor: colorPrimary,
    },
    overLay: {
        height: 100,
        width: '100%',
        position: 'absolute',

    },
    panoramic: {
        flex: 0,
        height: Dimensions.get('window').width * 9 / 16,
        backgroundColor: colorPrimary,
    },
    welcome: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
});
