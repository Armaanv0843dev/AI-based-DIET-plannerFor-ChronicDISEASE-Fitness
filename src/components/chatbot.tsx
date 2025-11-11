"use client";

import React, {useState, useRef, useEffect} from 'react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { X } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';

type Message = { from: 'user' | 'bot'; text: string; time?: string };

export function Chatbot({ className, profile }: { className?: string; profile?: any }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { from: 'bot', text: 'Hi! I can help you with diet and nutrition questions. Ask me anything about meal choices, portions, or dietary adaptations.', time: new Date().toLocaleTimeString() }
  ]);
  const [input, setInput] = useState('');
  const [userProfile, setUserProfile] = useState<any | undefined>(profile);
  const [loading, setLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [suggestionTargetIndex, setSuggestionTargetIndex] = useState<number | null>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({behavior: 'smooth'});
  }, [messages, open]);

  // autofocus textarea when opening
  useEffect(() => {
    if (open) {
      // wait a tick for animations/layout
      setTimeout(() => inputRef.current?.focus(), 120);
    }
  }, [open]);

  async function sendMessage() {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages(prev => [...prev, {from: 'user', text: userText, time: new Date().toLocaleTimeString()}]);
    setInput('');
    setLoading(true);
    setIsTyping(true);
    try {
      const res = await fetch('/api/chat-dietitian', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message: userText, profile: userProfile || profile}),
      });
      const data = await res.json();
      if (res.ok && data?.reply) {
        // push bot reply
  const botMsg: Message = { from: 'bot', text: data.reply, time: new Date().toLocaleTimeString() };
  const prevLen = messages.length;
  setMessages(prev => [...prev, botMsg as Message]);
        // attach suggestions to this bot message (render them under this index)
        if (Array.isArray(data.suggestions) && data.suggestions.length) {
          setSuggestions(data.suggestions);
          setSuggestionTargetIndex(prevLen);
        } else {
          setSuggestions([]);
          setSuggestionTargetIndex(null);
        }
      } else {
        setMessages(prev => [...prev, {from: 'bot', text: 'Sorry, I could not get a response. Please try again.', time: new Date().toLocaleTimeString()}]);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, {from: 'bot', text: 'Network error. Please try again.', time: new Date().toLocaleTimeString()}]);
    } finally {
      setLoading(false);
      setIsTyping(false);
      // keep focus on textarea after sending
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }

  useEffect(() => {
    function onDietPlanGenerated(e: Event) {
      const detail = (e as CustomEvent)?.detail;
      if (detail?.profile) setUserProfile(detail.profile);
      setOpen(true);
    }
    window.addEventListener('dietPlan:generated', onDietPlanGenerated as EventListener);
    return () => window.removeEventListener('dietPlan:generated', onDietPlanGenerated as EventListener);
  }, []);

  // small helper: escape html then convert **bold** to <strong>
  const escapeHtml = (unsafe: string) =>
    unsafe.replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'} as any)[c]);

  const renderMarkdown = (text: string) => {
    if (!text) return '';
    const escaped = escapeHtml(text);
    // bold **text** -> <strong>text</strong>
    const withBold = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // preserve line breaks
    return withBold.replace(/\n/g, '<br/>');
  };

  return (
    <div className={cn('fixed bottom-8 right-8 z-50', className)}>
      {!open && (
        <button
          aria-label="Open dietitian chat"
          onClick={() => setOpen(true)}
          className="h-14 w-14 rounded-full shadow-xl flex items-center justify-center hover:scale-105 transition-transform bg-white/90 backdrop-blur-sm border border-[#309c3e]"
        >
          <Avatar className="h-12 w-12">
            <AvatarImage src="/avatar-dietitian.png" alt="Dietitian" />
            <AvatarFallback>DD</AvatarFallback>
          </Avatar>
        </button>
      )}

      {open && (
  <Card className="w-96 md:w-[34rem] h-[85vh] max-h-[700px] shadow-2xl rounded-3xl border-2 border-[#309c3e] bg-white/95 backdrop-blur-sm overflow-hidden">
          <CardHeader className="relative bg-[#309c3e] rounded-t-3xl pt-3 pb-3 px-4">
            {/* Close button */}
            <button 
              aria-label="Close chat" 
              onClick={() => setOpen(false)}
              className="absolute top-7 right-3 p-0.5 rounded-full bg-white hover:bg-gray-100 transition-colors shadow-md z-10"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>

            {/* Header content */}
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 rounded-full">
                <AvatarImage src="/avatar-dietitian.png" alt="Dietitian" className="rounded-full object-cover" />
                <AvatarFallback>DA</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg font-semibold text-white">Diet Assistant</CardTitle>
                <p className="text-xs text-white/90">Online</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col h-[calc(100%-3.5rem)] p-0">
            <div className="flex-1 overflow-y-auto py-4 px-4 space-y-4">
              {messages.map((m, i) => (
                <div key={i} className={cn('flex items-end gap-2', 
                  m.from === 'user' ? 'justify-end' : 'justify-start',
                  'group transition-opacity')}>
                  {m.from === 'bot' && (
                    <Avatar className="h-8 w-8 mb-1">
                      <AvatarImage src="/avatar-dietitian.png" alt="Dietitian" />
                      <AvatarFallback>DD</AvatarFallback>
                    </Avatar>
                  )}

                  <div className={cn('max-w-[80%] break-words', m.from === 'user' ? 'text-right' : 'text-left')}>
                    <div 
                      className={cn(
                        'inline-block px-4 py-2.5',
                        m.from === 'user' 
                          ? 'bg-[#E6F8E6] text-[#0f2a14] rounded-[20px] rounded-br-[5px] border border-[#309c3e]'
                          : 'bg-white text-[#111b13] rounded-[20px] rounded-bl-[5px] shadow-sm border border-[#309c3e]/30'
                      )} 
                      dangerouslySetInnerHTML={{__html: renderMarkdown(m.text)}} 
                    />
                    <div className="text-[11px] text-muted-foreground/70 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {m.time}
                    </div>
                  </div>

                  {m.from === 'user' && (
                    <Avatar className="h-8 w-8 mb-1">
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}


              {isTyping && (
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatar-dietitian.png" alt="Dietitian" />
                    <AvatarFallback>DD</AvatarFallback>
                  </Avatar>
                  <div className="inline-block bg-background px-3 py-2 rounded-xl">
                    <div className="flex gap-1">
                      <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse inline-block"></span>
                      <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse inline-block delay-75"></span>
                      <span className="h-2 w-2 bg-gray-400 rounded-full animate-pulse inline-block delay-150"></span>
                    </div>
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {suggestions.length > 0 && suggestionTargetIndex !== null && (
              <div className="flex gap-2 flex-wrap px-2 mb-4">
                {suggestions.map((sug, si) => (
                  <button
                    key={si}
                    onClick={() => {
                      setInput(sug);
                      setSuggestions([]);
                      setSuggestionTargetIndex(null);
                      // Send the message immediately
                      setTimeout(() => sendMessage(), 0);
                    }}
                    className="px-3 py-1.5 rounded-full bg-white hover:bg-[#f1fbf1] text-[#0f2a14] text-sm border border-[#309c3e] shadow-sm transition-all hover:shadow-md"
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}

            <div className="relative">
              <div className="relative flex items-center gap-2 rounded-full border-2 border-[#309c3e] bg-white shadow-sm p-2">
                <Textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInput(e.target.value)}
                  placeholder="Message"
                  onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  disabled={loading}
                  className="flex-1 resize-none border-0 outline-none shadow-none focus-visible:ring-0 bg-transparent px-4 py-2 text-[15px] min-h-[18px] max-h-[50px] overflow-hidden placeholder:text-[#000000]/80 rounded-full"
                />
                <Button 
                  onClick={sendMessage} 
                  disabled={loading} 
                  size="icon"
                  variant="default"
                  className="rounded-full h-10 w-10 shrink-0 bg-[#309c3e] hover:bg-[#309c3e]/90"
                >
                  {loading ? '...' : '➤'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
