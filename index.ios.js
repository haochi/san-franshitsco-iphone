'use strict';

var React = require('react-native');
var {
    MapView,
    StyleSheet,
    Text,
    TextInput,
    View,
    AppRegistry
} = React;

var views = {
    MAP: 1,
    DETAIL: 2
};

var SanFranshitsco = React.createClass({

    watchID: null,

    getInitialState() {
        return {
            mapHeight: 200,
            mapRegion: {
                latitude: 0,
                longitude: 0,
                latitudeDelta: 0.25,
                longitudeDelta: 0.25
            },
            annotations: null,
            view: views.MAP,
            image: null,
        };
    },

    render() {
        switch (this.state.view) {
            case views.DETAIL: return this._renderDetail(); break;
            default: return this._renderMap(); break;
        }
    },

    componentDidMount: function() {
        this._fetchPoop();
        navigator.geolocation.watchPosition(
            (position) => {
                let center = Object.assign({}, this.state.mapRegion);
                let {
                    latitude, longitude
                } = position.coords;
                center.latitude = latitude;
                center.longitude = longitude;

                this.setState({
                    mapRegion: center
                });
            }, (error) => alert(error.message), {
                enableHighAccuracy: true,
                timeout: 20000,
                maximumAge: 1000
            }
        );
    },

    componentWillUnmount: function() {
        navigator.geolocation.clearWatch(this.watchID);
    },

    _renderDetail() {
    var movie = {title: 'Title', year: '2015', posters: {thumbnail: 'http://i.imgur.com/UePbdph.jpg'} };
      <View style={styles.container}>
        <Text>{movie.title}</Text>
        <Text>{movie.year}</Text>
        <Image source={{uri: movie.posters.thumbnail}} style={styles.thumbnail} />
      </View>
    },

    _renderMap() {
        return (
            <View
                style={ styles.container }
                onLayout={ this._onViewLayout }
            >
                <MapView
                    style={ [styles.map, { height: this.state.mapHeight }] }
                    showsUserLocation={ true }
                    region={ this.state.mapRegion || undefined }
                    annotations={ this.state.annotations || undefined }
                />
            </View>
        );
    },

    _onCalloutClick(id) {
        var annotation = this.state.annotations.filter((annotation) => annotation.id == id)[0];
        this.setState({
            image: annotation.image,
            view: views.DETAIL
        });
    },

    _fetchPoop() {
        var url = "https://data.sfgov.org/resource/vw6y-z8j6.json?$limit=5000&$offset=0&request_details=Human+Waste&$where=" + encodeURIComponent("opened > '2015-07-13T00:00:00.000'");
        fetch(url)
            .then((response) => response.json())
            .then((poops) => {
                return poops.map((poop, index) => {
                    let image = poop.media_url && poop.media_url.url;
                    return {
                        id: '' + index,
                        latitude: parseFloat(poop.point.latitude),
                        longitude: parseFloat(poop.point.longitude),
                        title: poop.address,
                        subtitle: poop.neighborhood,
                        image: image,
                        hasRightCallout: !!image,
                        onRightCalloutPress: ({ annotationId }) => this._onCalloutClick(annotationId)
                    }
                })
                .filter((poop) => poop.hasRightCallout);
            })
            .then((points) => this.setState({ annotations: points }))
            .done();
    },

    _onViewLayout(event) {
        var { width, height } = event.nativeEvent.layout;
        this.setState({
            mapHeight: height
        });
    }
});

var styles = StyleSheet.create({
    map: {
        height: 350
    },
    container: {
        flex: 1
    },
    thumbnail: {
        width: 53,
        height: 81,
  },
});

AppRegistry.registerComponent('SanFranshitsco', () => SanFranshitsco);
