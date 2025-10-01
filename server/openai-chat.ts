import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function getChatResponse(messages: ChatMessage[]): Promise<string> {
  try {
    // System prompt pour configurer l'agent Carivoo
    const systemPrompt: ChatMessage = {
      role: "system",
      content: `Tu es l'assistant virtuel de Carivoo, une plateforme de location de véhicules de luxe.

INFORMATIONS SUR CARIVOO:
- Plateforme de location de véhicules de luxe entre agences et clients
- Catégories disponibles: Sportive, Berline, SUV Luxe, Cabriolet, Électrique, Hybride, Supercar
- Paiement sécurisé via Stripe (carte bancaire, Apple Pay)
- Caution obligatoire (montant variable selon le véhicule)
- Abonnement Premium pour les agences: €29.99/mois pour plus de visibilité
- Commission plateforme: 10% sur chaque réservation

CONTACT:
- Téléphone: 06 81 18 88 52
- Instagram: @carivoo_officiel
- TikTok: @carivoo_

RÔLE:
- Réponds en français de manière professionnelle et courtoise
- Aide les utilisateurs avec leurs questions sur les véhicules, tarifs, réservations
- Guide les agences sur le processus d'inscription et l'abonnement Premium
- Explique le processus de location et les conditions
- Pour les questions techniques précises, recommande de contacter le support

Reste concis et utile. Si tu ne connais pas la réponse exacte, suggère de contacter le support.`,
    };

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-5", // the newest OpenAI model is "gpt-5" which was released August 7, 2025
      messages: [systemPrompt, ...messages],
      max_tokens: 500,
    });

    return response.choices[0].message.content || "Désolé, je n'ai pas pu générer une réponse.";
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Clé API OpenAI non configurée. Veuillez contacter l'administrateur.");
    }
    
    throw new Error("Erreur lors de la communication avec l'assistant IA. Veuillez réessayer.");
  }
}
