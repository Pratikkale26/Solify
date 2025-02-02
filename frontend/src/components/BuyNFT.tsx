import { useState } from "react";
import { toast } from "react-toastify";

const nftCollection = [
  { id: 1, name: "CryptoPunk #26", price: "2.5 SOL", image: "https://miro.medium.com/v2/resize:fit:1400/1*309P7s3s2nauQM_-MQU6Pg.png" },
  { id: 2, name: "Carsow #20", price: "180 SOL", image: "https://riseangle.com/storage/events/uKfhTk8kOKKDqLvl06Xm2IFDvcdbmrKSrevj1WSf.gif" },
  { id: 3, name: "Degen Ape", price: "3.2 SOL", image: "https://miro.medium.com/v2/resize:fit:273/1*mwaCSzH_te-zFs60913Afw.png" },
];

const BuyNFT = () => {
  const [loading, setLoading] = useState(false);

  const handleBuy = (nftName: string) => {
    setLoading(true);
    setTimeout(() => {
      toast.success(`Successfully purchased ${nftName}!`);
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center mt-45 bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Buy NFTs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {nftCollection.map((nft) => (
          <div key={nft.id} className="bg-gray-800 p-4 rounded-lg shadow-lg text-center">
            <img src={nft.image} alt={nft.name} className="w-full h-48 object-cover rounded-lg mb-4" />
            <h2 className="text-2xl font-semibold">{nft.name}</h2>
            <p className="text-gray-400 mb-4">{nft.price}</p>
            <button
              onClick={() => handleBuy(nft.name)}
              className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Processing..." : "Buy Now"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BuyNFT;
