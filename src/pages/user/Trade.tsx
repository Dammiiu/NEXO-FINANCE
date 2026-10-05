import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ArrowDownUp,
  DollarSign,
  Wallet,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { UserProfile, CryptoAsset, SpotHolding, TradeOrder } from '../../types';
import AreaChart from '../../components/AreaChart';

interface TradeProps {
  user: UserProfile;
  cryptoPrices: CryptoAsset[];
  authToken: string;
  theme?: 'dark' | 'light';
  onRefreshUser: () => void;
}

export const Trade: React.FC<TradeProps> = ({
  user,
  cryptoPrices,
  authToken,
  theme = 'dark',
  onRefreshUser,
}) => {
  // Placeholder used only until the first live ticker arrives. Price is zero so
// the form cannot quote or submit against a stale hardcoded number; the
// server resolves the real fill price regardless.
  const [selectedCoin, setSelectedCoin] = useState<CryptoAsset>(cryptoPrices[0] || {
    symbol: 'BTC',
    name: 'Bitcoin',
    price: 0,
    change24h: 0,
    high24h: 0,
    low24h: 0,
    volume24h: 0,
    sparkline: [],
  });

  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [orderMode, setOrderMode] = useState<'market' | 'limit'>('market');
  const [amountUsd, setAmountUsd] = useState<string>('500');
  const [cryptoAmount, setCryptoAmount] = useState<string>('0');
  const [holdings, setHoldings] = useState<SpotHolding[]>([]);
  const [orders, setOrders] = useState<TradeOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (cryptoPrices.length > 0) {
      const match = cryptoPrices.find((c) => c.symbol === selectedCoin.symbol);
      if (match) setSelectedCoin(match);
    }
  }, [cryptoPrices]);

  const fetchPortfolioAndOrders = async () => {
    try {
      const [holdRes, ordersRes] = await Promise.all([
        fetch('/api/trade/portfolio', { headers: { Authorization: `Bearer ${authToken}` } }),
        fetch('/api/trade/history', { headers: { Authorization: `Bearer ${authToken}` } }),
      ]);
      if (holdRes.ok) {
        const data = await holdRes.json();
        setHoldings(data.holdings || []);
      }
      if (ordersRes.ok) {
        const oData = await ordersRes.json();
        setOrders(oData || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPortfolioAndOrders();
  }, [authToken]);

  // Update cryptoAmount when amountUsd or price changes
  useEffect(() => {
    const usd = parseFloat(amountUsd) || 0;
    if (selectedCoin.price > 0) {
      setCryptoAmount((usd / selectedCoin.price).toFixed(8));
    }
  }, [amountUsd, selectedCoin]);

  const handleExecuteTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setErrorMessage(null);

    const val = parseFloat(amountUsd);
    if (!val || val <= 0) {
      setErrorMessage('Please specify a valid trade amount.');
      return;
    }

    if (!(selectedCoin.price > 0)) {
      setErrorMessage('Waiting for the live price feed. Please try again in a moment.');
      return;
    }

    if (tradeType === 'buy' && val > (user?.balance ?? 0)) {
       setErrorMessage(`Insufficient cash balance ($${(user?.balance ?? 0).toLocaleString()}) to execute this buy order.`);
      return;
    }

    // Sells are clamped to the position actually held. The USD input implies a
    // quantity, and rounding that to a fixed number of decimals could ask for
    // marginally more than the holding - which used to reject selling the whole
    // position.
    let sellQty = 0;
    if (tradeType === 'sell') {
      const held = holdings.find((h) => h.symbol === selectedCoin.symbol);
      const heldAmount = held ? parseFloat(String(held.amount)) : 0;
      const wantQty = parseFloat(cryptoAmount) || 0;
      if (!held || heldAmount <= 0) {
        setErrorMessage(
          `You do not currently hold any ${selectedCoin.symbol}. Buy ${selectedCoin.symbol} before selling.`
        );
        return;
      }
      if (wantQty > heldAmount) {
        if (wantQty - heldAmount > heldAmount * 0.001) {
          setErrorMessage(
            `Insufficient ${selectedCoin.symbol} holdings. You hold ${heldAmount.toLocaleString(undefined, {
              maximumFractionDigits: 8,
            })} ${selectedCoin.symbol}.`
          );
          return;
        }
        sellQty = heldAmount;
      } else {
        sellQty = wantQty;
      }
    }

    setIsLoading(true);
    try {
      const endpoint = tradeType === 'buy' ? '/api/trade/buy' : '/api/trade/sell';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: selectedCoin.symbol,
          coinName: selectedCoin.name,
          amountUsd: val,
          cryptoAmount: tradeType === 'sell' ? sellQty : parseFloat(cryptoAmount),
          // The server resolves the authoritative price itself and ignores this
          // value, so a tampered request cannot move the fill price.
          price: selectedCoin.price,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const filledQty = typeof data.amount === 'number' ? data.amount : parseFloat(cryptoAmount);
        setMessage(
          `Filled ${tradeType.toUpperCase()} of ${filledQty.toLocaleString(undefined, {
            maximumFractionDigits: 8,
          })} ${selectedCoin.symbol} at $${Number(data.price ?? selectedCoin.price).toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })} ($${Number(data.total ?? val).toLocaleString(undefined, { maximumFractionDigits: 2 })}).`
        );
        onRefreshUser();
        fetchPortfolioAndOrders();
      } else {
        setErrorMessage(data.error || 'Failed to execute trade order.');
      }
    } catch (err) {
      setErrorMessage('Connection error communicating with trade desk.');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedHolding = holdings.find((h) => h.symbol === selectedCoin.symbol);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header and Quick Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-[#00FFB2] border border-emerald-500/30 dark:border-[#00FFB2]/20 mb-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Nexo Spot Exchange • Real-Time Order Matching</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Institutional Trade Desk
          </h2>
          <p className="text-slate-500 dark:text-gray-400 text-xs md:text-sm">
            Execute sub-millisecond spot crypto buys and sells with zero slippage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-2 rounded-2xl border text-xs flex items-center gap-3 ${
              theme === 'dark' ? 'bg-[#121622] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
            }`}
          >
            <div>
              <span className="text-slate-500 dark:text-gray-400 block text-[10px]">Available Cash</span>
              <span className="font-black text-slate-900 dark:text-white text-sm font-mono">
                ${(user?.balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            {selectedHolding && (
              <div className="border-l border-slate-200 dark:border-gray-700 pl-3">
                <span className="text-slate-500 dark:text-gray-400 block text-[10px]">{selectedCoin.symbol} Holdings</span>
                <span className="font-black text-emerald-600 dark:text-[#00FFB2] text-sm font-mono">
                  {selectedHolding.amount.toFixed(4)} {selectedCoin.symbol}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid: Chart & Order Terminal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Column */}
        <div
          className={`lg:col-span-2 p-6 rounded-3xl border flex flex-col justify-between ${
            theme === 'dark' ? 'bg-[#121622] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          {/* Pair Selector Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 border-b border-slate-100 dark:border-gray-800 mb-4">
            {cryptoPrices.map((coin) => (
              <button
                key={coin.symbol}
                onClick={() => setSelectedCoin(coin)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                  selectedCoin.symbol === coin.symbol
                    ? 'bg-[#00FFB2] text-black shadow-md'
                    : 'bg-slate-100 dark:bg-gray-900 text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <span>{coin.symbol}/USDT</span>
                <span
                  className={`text-[10px] ${
                    coin.change24h >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {coin.change24h >= 0 ? '+' : ''}
                  {coin.change24h}%
                </span>
              </button>
            ))}
          </div>

          <AreaChart
            theme={theme}
            symbol={`${selectedCoin.symbol}/USDT`}
            currentPrice={selectedCoin.price}
            change24h={selectedCoin.change24h}
          />
        </div>

        {/* Order Terminal Column */}
        <div
          className={`p-6 rounded-3xl border ${
            theme === 'dark' ? 'bg-[#121622] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
          }`}
        >
          <div className="space-y-4">
            {/* Buy / Sell Toggle */}
            <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-100 dark:bg-gray-900 border border-slate-200 dark:border-gray-800">
              <button
                type="button"
                onClick={() => setTradeType('buy')}
                className={`py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition ${
                  tradeType === 'buy'
                    ? 'bg-emerald-500 text-white shadow-md'
                    : 'text-slate-500 dark:text-gray-400 hover:text-white'
                }`}
              >
                Spot Buy
              </button>
              <button
                type="button"
                onClick={() => setTradeType('sell')}
                className={`py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition ${
                  tradeType === 'sell'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-slate-500 dark:text-gray-400 hover:text-white'
                }`}
              >
                Spot Sell
              </button>
            </div>

            {/* Notifications */}
            {message && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleExecuteTrade} className="space-y-4 text-xs">
              {/* Order Mode (Market / Limit) */}
              <div className="flex justify-between items-center text-xs text-slate-500 dark:text-gray-400">
                <span className="font-semibold">Order Mode</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setOrderMode('market')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      orderMode === 'market' ? 'bg-[#00FFB2] text-black' : 'bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    Market (Instant)
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderMode('limit')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      orderMode === 'limit' ? 'bg-[#00FFB2] text-black' : 'bg-slate-100 dark:bg-gray-800 text-slate-500 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    Limit
                  </button>
                </div>
              </div>

              {/* Amount USD */}
              <div>
                <label className="block text-slate-500 dark:text-gray-400 font-semibold mb-1">
                  Order Value in USD
                </label>
                <div className="relative">
                  <DollarSign className="w-4 h-4 absolute left-3 top-3 text-slate-500 dark:text-gray-400" />
                  <input
                    type="number"
                    min="10"
                    step="any"
                    value={amountUsd}
                    onChange={(e) => setAmountUsd(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-gray-950 border border-slate-200 dark:border-gray-800 rounded-xl pl-9 pr-14 py-2.5 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#00FFB2]"
                  />
                  <span className="absolute right-3 top-2.5 text-slate-500 dark:text-gray-400 font-bold">USD</span>
                </div>
              </div>

              {/* Preset buttons */}
              <div className="grid grid-cols-4 gap-2">
                {['100', '250', '500', '1000'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAmountUsd(preset)}
                    className="py-1 rounded-lg bg-slate-100 dark:bg-gray-800/80 hover:bg-slate-200 dark:hover:bg-gray-700 text-slate-700 dark:text-gray-300 font-bold text-[11px]"
                  >
                    ${preset}
                  </button>
                ))}
              </div>

              {/* Estimated Crypto Output */}
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-gray-950/80 border border-slate-200 dark:border-gray-800 space-y-1.5">
                <div className="flex justify-between text-slate-500 dark:text-gray-400">
                  <span>Execution Price:</span>
                  <span className="font-mono text-slate-900 dark:text-white font-bold">
                    ${selectedCoin.price.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-500 dark:text-gray-400">
                  <span>Est. {selectedCoin.symbol} Received:</span>
                  <span className="font-mono text-emerald-600 dark:text-[#00FFB2] font-black">{cryptoAmount} {selectedCoin.symbol}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-gray-500">
                  <span>Trading Fee:</span>
                  <span className="text-emerald-600 dark:text-emerald-500 font-bold">0.00% (VIP Tier)</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition shadow-lg cursor-pointer ${
                  tradeType === 'buy'
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20'
                    : 'bg-rose-500 hover:bg-rose-400 text-white shadow-rose-500/20'
                }`}
              >
                {isLoading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  `Execute ${tradeType.toUpperCase()} (${selectedCoin.symbol})`
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Asset Holding Catalog Table */}
      <div
        className={`p-6 rounded-3xl border space-y-4 ${
          theme === 'dark' ? 'bg-[#121622] border-gray-800' : 'bg-white border-slate-200 shadow-sm'
        }`}
      >
        <div>
          <h3 className="font-black text-base flex gap-2 items-center text-slate-900 dark:text-white">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
            <span>Asset Holding Catalog</span>
          </h3>
          <p className="text-slate-500 dark:text-gray-400 text-xs mt-1">Detailed list of cryptocurrency coins stored in your trading wallets.</p>
        </div>

        {holdings.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Wallet className="w-10 h-10 text-slate-500 dark:text-gray-500 mx-auto" />
            <p className="text-xs text-slate-500 dark:text-gray-400">No crypto spot holdings yet. Execute a buy order above to start building your portfolio.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 dark:text-gray-500 uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-gray-800">
                <tr>
                  <th className="pb-3">Asset</th>
                  <th className="pb-3">Quantity</th>
                  <th className="pb-3">Avg Buy Price</th>
                  <th className="pb-3">Current Price</th>
                  <th className="pb-3">Current Value</th>
                  <th className="pb-3">Unrealized P&L</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-gray-800/60">
                {holdings.map((h) => {
                  const isProfit = h.pnl >= 0;
                  return (
                    <tr key={h.symbol} className="hover:bg-slate-50 dark:hover:bg-gray-800/30">
                      <td className="py-3 font-extrabold text-sm text-slate-900 dark:text-white">{h.symbol}</td>
                      <td className="py-3 font-mono font-bold text-slate-900 dark:text-white">{Number(h.amount).toLocaleString(undefined, { maximumFractionDigits: 8 })}</td>
                      <td className="py-3 font-mono text-slate-500 dark:text-gray-400">${h.avgBuyPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-3 font-mono text-slate-900 dark:text-white font-bold">${h.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-3 font-mono font-bold text-emerald-600 dark:text-[#00FFB2]">${h.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                      <td className="py-3">
                        <span className={`font-bold font-mono ${isProfit ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-600 dark:text-rose-500'}`}>
                          {isProfit ? '+' : '-'
                          }${Math.abs(h.pnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}{' '}
                          ({isProfit ? '+' : ''}{Number(h.pnlPercent).toFixed(2)}%)
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            const coin = cryptoPrices.find((c) => c.symbol === h.symbol);
                            if (coin) setSelectedCoin(coin);
                            setTradeType('sell');
                          }}
                          className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white font-bold text-[11px] transition"
                        >
                          Quick Sell
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default Trade;
