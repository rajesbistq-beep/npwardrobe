import type { ReactNode } from "react";
import { AccordionItem } from "@/components/ui/accordion";
export function FaqAccordion({ items }: { items: Array<{ id: string; question: string; answer: ReactNode }> }) {
  return <div className="faq-list">{items.map((item, index) => <AccordionItem key={item.id} title={item.question} defaultOpen={index === 0}>{item.answer}</AccordionItem>)}</div>;
}
