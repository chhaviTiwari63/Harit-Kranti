import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSpeech } from "@/hooks/useSpeech";
import {
  Users,
  Phone,
  MessageCircle,
  WifiOff,
  Send,
  ArrowLeft,
} from "lucide-react";

interface CommunityProps {
  userLanguage: string;
  onBack: () => void; // ✅ Added onBack for navigation
}

interface Post {
  id: number;
  author: string;
  message: string;
  replies: number;
}

export default function Community({ userLanguage, onBack }: CommunityProps) {
  const { speak } = useSpeech();
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [posts, setPosts] = useState<Post[]>([
    {
      id: 1,
      author: "🌾 Ravi (Farmer)",
      message: "My paddy crops are showing yellow leaves, what can I do?",
      replies: 3,
    },
    {
      id: 2,
      author: "👩‍🌾 Anita (KVK Expert)",
      message: "Apply urea in small doses and maintain proper irrigation.",
      replies: 1,
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const farmerCommunities = [
    { name: userLanguage === "hi" ? "धान किसान" : "Paddy Farmers", color: "bg-green-200" },
    { name: userLanguage === "hi" ? "गेहूँ किसान" : "Wheat Farmers", color: "bg-yellow-200" },
    { name: userLanguage === "hi" ? "सब्जी किसान" : "Vegetable Growers", color: "bg-red-200" },
    { name: userLanguage === "hi" ? "फल किसान" : "Fruit Growers", color: "bg-pink-200" },
    { name: userLanguage === "hi" ? "डेयरी किसान" : "Dairy Farmers", color: "bg-blue-200" },
  ];

  useEffect(() => {
    const msg =
      userLanguage === "hi"
        ? "यह किसान समुदाय मंच है। यहाँ आप सवाल पूछ सकते हैं और कृषि विज्ञान केंद्र से मदद ले सकते हैं।"
        : "This is the farmer community forum. Ask questions and get help from Krishi Vigyan Kendra experts.";
    setTimeout(() => speak(msg, { lang: userLanguage === "hi" ? "hi-IN" : "en-US" }), 800);

    const updateStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    return () => {
      window.removeEventListener("online", updateStatus);
      window.removeEventListener("offline", updateStatus);
    };
  }, [userLanguage, speak]);

  const handlePost = () => {
    if (!newMessage.trim()) return;
    const newPost: Post = {
      id: posts.length + 1,
      author: "🧑‍🌾 You",
      message: newMessage,
      replies: 0,
    };
    setPosts([newPost, ...posts]);
    setNewMessage("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-100 to-green-200 p-4 space-y-6 pb-24">
      {/* Header with Back */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-green-800 font-semibold hover:text-green-900 transition"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {userLanguage === "hi" ? "डैशबोर्ड पर वापस जाएं" : "Back to Dashboard"}
        </button>
        <h1 className="text-2xl font-bold flex items-center text-green-900">
          <Users className="w-6 h-6 mr-2 text-primary" />
          {userLanguage === "hi" ? "किसान समुदाय" : "Farmer Community"}
        </h1>
      </div>

      {/* Offline Notice */}
      {!isOnline && (
        <Card className="border-destructive bg-red-50">
          <CardContent className="flex items-center space-x-2 text-destructive p-3">
            <WifiOff className="w-5 h-5" />
            <span className="font-medium">
              {userLanguage === "hi"
                ? "आप ऑफलाइन हैं। पोस्ट बाद में भेजा जाएगा।"
                : "You are offline. Posts will be saved locally."}
            </span>
          </CardContent>
        </Card>
      )}

      {/* Farmer Groups */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-lg text-green-800">
            <Users className="w-5 h-5 mr-2 text-primary" />
            {userLanguage === "hi" ? "किसान समूह" : "Farmer Groups"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {farmerCommunities.map((c, idx) => (
            <span
              key={idx}
              className={`px-3 py-2 rounded-full text-sm font-medium cursor-pointer shadow ${c.color}`}
            >
              {c.name}
            </span>
          ))}
        </CardContent>
      </Card>

      {/* Post Form */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center text-lg text-green-800">
            <MessageCircle className="w-5 h-5 mr-2 text-primary" />
            {userLanguage === "hi" ? "अपना सवाल पूछें" : "Ask Your Question"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex space-x-2">
          <Input
            placeholder={
              userLanguage === "hi"
                ? "यहाँ अपना संदेश लिखें..."
                : "Type your message here..."
            }
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-grow rounded-xl"
          />
          <Button onClick={handlePost} className="rounded-xl">
            <Send className="w-4 h-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post) => (
          <Card
            key={post.id}
            className="bg-white shadow-md rounded-xl border border-green-100"
          >
            <CardHeader className="pb-2">
              <CardTitle className="text-green-900 text-lg">
                {post.author}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-2">{post.message}</p>
              <span className="text-gray-500 text-sm">
                {post.replies} {userLanguage === "hi" ? "उत्तर" : "replies"}
              </span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* KVK Helpline */}
      <Card className="shadow-lg border-green-300 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center text-lg text-green-900">
            <Phone className="w-5 h-5 mr-2 text-green-700" />
            {userLanguage === "hi"
              ? "कृषि विज्ञान केंद्र हेल्पलाइन"
              : "Krishi Vigyan Kendra Helpline"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-gray-700">
            {userLanguage === "hi"
              ? "विशेषज्ञ से तुरंत मदद पाने के लिए कॉल या मैसेज करें।"
              : "Call or message experts for instant help."}
          </p>
          <div className="flex space-x-3">
            <Button
              className="bg-green-700 text-white w-1/2 rounded-xl"
              onClick={() => window.open("tel:18001801551")}
            >
              📞 {userLanguage === "hi" ? "कॉल करें" : "Call Now"}
            </Button>
            <Button
              className="bg-blue-600 text-white w-1/2 rounded-xl"
              onClick={() => window.open("sms:18001801551")}
            >
              💬 {userLanguage === "hi" ? "मैसेज भेजें" : "Send SMS"}
            </Button>
          </div>
          <p className="text-gray-500 text-sm">
            {userLanguage === "hi"
              ? "टोल-फ्री नंबर: 1800-180-1551"
              : "Toll-free number: 1800-180-1551"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
