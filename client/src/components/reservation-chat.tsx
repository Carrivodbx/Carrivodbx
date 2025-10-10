import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import type { Message } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface ReservationChatProps {
  reservationId: string;
  receiverId: string;
  vehicleTitle: string;
}

export default function ReservationChat({ reservationId, receiverId, vehicleTitle }: ReservationChatProps) {
  const [open, setOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: messages, isLoading } = useQuery<Message[]>({
    queryKey: ["/api/reservations", reservationId, "messages"],
    queryFn: async () => {
      const response = await fetch(`/api/reservations/${reservationId}/messages`);
      if (!response.ok) throw new Error("Failed to fetch messages");
      return response.json();
    },
    enabled: open,
    refetchInterval: open ? 5000 : false, // Poll every 5 seconds when dialog is open
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/messages", {
        content,
        receiverId,
        reservationId,
        read: false,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reservations", reservationId, "messages"] });
      setMessageContent("");
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer le message",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageContent.trim()) return;
    sendMessageMutation.mutate(messageContent);
  };

  // Mark unread messages as read when dialog opens
  useEffect(() => {
    if (open && messages) {
      const unreadMessages = messages.filter(m => m.receiverId === user?.id && !m.read);
      unreadMessages.forEach(async (message) => {
        try {
          await apiRequest("PATCH", `/api/messages/${message.id}/read`);
        } catch (error) {
          console.error("Failed to mark message as read:", error);
        }
      });
      if (unreadMessages.length > 0) {
        // Refresh messages after marking as read
        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ["/api/reservations", reservationId, "messages"] });
        }, 500);
      }
    }
  }, [open, messages, user?.id, reservationId, queryClient]);

  const unreadCount = messages?.filter(m => m.receiverId === user?.id && !m.read).length || 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" data-testid={`button-messages-${reservationId}`}>
          <MessageCircle className="mr-2" size={16} />
          Messages
          {unreadCount > 0 && (
            <span className="ml-2 bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs">
              {unreadCount}
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] h-[600px] flex flex-col glass-morphism">
        <DialogHeader>
          <DialogTitle className="font-orbitron text-xl">
            Messagerie - {vehicleTitle}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="flex-1 pr-4">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded-lg animate-pulse" />
              ))}
            </div>
          ) : messages?.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="mx-auto mb-4 text-muted-foreground" size={48} />
              <p className="text-muted-foreground">Aucun message pour le moment.</p>
              <p className="text-sm text-muted-foreground mt-2">
                Commencez la conversation pour discuter de votre réservation.
              </p>
            </div>
          ) : (
            <div className="space-y-4" data-testid={`messages-list-${reservationId}`}>
              {messages?.map((message) => {
                const isOwnMessage = message.senderId === user?.id;
                return (
                  <div
                    key={message.id}
                    className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    data-testid={`message-${message.id}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        isOwnMessage
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground"
                      }`}
                    >
                      <p className="text-sm break-words" data-testid={`message-content-${message.id}`}>
                        {message.content}
                      </p>
                      <p className="text-xs mt-1 opacity-70">
                        {new Date(message.createdAt!).toLocaleString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          day: '2-digit',
                          month: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="flex gap-2 pt-4 border-t">
          <Input
            placeholder="Tapez votre message..."
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            className="flex-1"
            data-testid={`input-message-${reservationId}`}
          />
          <Button 
            type="submit" 
            disabled={!messageContent.trim() || sendMessageMutation.isPending}
            data-testid={`button-send-${reservationId}`}
          >
            <Send size={16} />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
