'use strict';

var React = require('react-native');
var {
    MapView,
    StyleSheet,
    Text,
    TextInput,
    View,
    Image,
    TouchableHighlight,
    AppRegistry
} = React;

var views = {
    MAP: 1,
    DETAIL: 2
};

var styles = {
    map: StyleSheet.create({
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
    }),

    detail: StyleSheet.create({
      container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
      },
    })
}

var SanFranshitsco = React.createClass({
    watchID: null,

    getInitialState() {
        return {
            height: 200,
            width: 100,
            mapRegion: {
                latitude: 0,
                longitude: 0,
                latitudeDelta: 0.25,
                longitudeDelta: 0.25
            },
            annotations: null,
            view: views.MAP,
            annotation: null,
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
        this.watchID = navigator.geolocation.getCurrentPosition(
            (position) => {
                let center = Object.assign({}, this.state.mapRegion);
                let { latitude, longitude } = position.coords;
                center.latitude = latitude;
                center.longitude = longitude;
                this.setState({ mapRegion: center });
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
        var { annotation, width, height } = this.state;

        return (
          <View style={styles.detail.container}>
            <Image source={{uri: annotation.image}} style={ { width: width * .7, height: height * .7 } } />
            <Text style={ { marginTop: 10 } }>{annotation.title}</Text>
            <Text>{annotation.subtitle}</Text>
            <TouchableHighlight
                onPress={this._goBackToMap}
                style={{marginTop: 10, backgroundColor: '#000000', borderRadius: 5, padding: 10 }}
            >
                <Text style={{ color: '#ffffff' }}>Back to the Glorious Map</Text>
            </TouchableHighlight>
          </View>
        );
    },

    _renderMap() {
        return (
            <View style={ styles.map.container } onLayout={ this._onViewLayout }>
                <MapView
                    style={ [styles.map.map, { height: this.state.height }] }
                    showsUserLocation={ true }
                    region={ this.state.mapRegion || undefined }
                    annotations={ this.state.annotations || undefined }
                />
            </View>
        );
    },

    _onCalloutClick(id) {
        var annotation = this.state.annotations.filter((annotation) => annotation.id == id)[0];
        this.setState({ annotation: annotation, view: views.DETAIL });
    },

    _goBackToMap() {
        this.setState({ view: views.MAP });
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
                    };
                })
                .filter((poop) => poop.hasRightCallout);
            })
            .then((points) => this.setState({ annotations: points }))
            .done();
    },

    _onViewLayout(event) {
        var { width, height } = event.nativeEvent.layout;
        this.setState({ width, height });
    }
});



AppRegistry.registerComponent('SanFranshitsco', () => SanFranshitsco);
