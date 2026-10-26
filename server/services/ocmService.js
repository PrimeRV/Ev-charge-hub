const OCM_BASE_URL =
  "https://api.openchargemap.io/v3/poi/";

export async function fetchPuneStations() {
  const params = new URLSearchParams({
    output: "json",
    countrycode: "IN",

    latitude: "18.5204",
    longitude: "73.8567",

    distance: "30",
    distanceunit: "KM",

    maxresults: "100",

    compact: "false",
    verbose: "true",

    key: process.env.OCM_API_KEY,
  });

  const response = await fetch(
    `${OCM_BASE_URL}?${params.toString()}`,
    {
      headers: {
        "User-Agent":
          "EV-ChargeHub-MCA-Project/1.0",
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Open Charge Map API error: ${response.status}`
    );
  }

  return response.json();
}