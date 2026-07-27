type GoogleMapsPlace = {
  fetchFields(options: { fields: string[] }): Promise<void>;
  googleMapsURI?: string;
  rating?: number;
  userRatingCount?: number;
};

type GoogleMapsPlacesLibrary = {
  Place: new (options: { id: string }) => GoogleMapsPlace;
};

interface Window {
  __groupePureGoogleMapsReady?: () => void;
  google?: {
    maps?: {
      importLibrary(library: "places"): Promise<GoogleMapsPlacesLibrary>;
    };
  }
}
