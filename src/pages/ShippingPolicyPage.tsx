import React from 'react';
import { Truck, CheckCircle2 } from 'lucide-react';

export const ShippingPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-2xs space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#003893] bg-blue-50 px-2.5 py-1 rounded">
              Logística e Prazos
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
              Política de Entrega e Frete Grátis
            </h1>
          </div>

          <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 flex items-center gap-3">
            <Truck className="w-8 h-8 text-[#003893] shrink-0" />
            <div>
              <h3 className="font-bold text-[#003893] text-sm">
                Regra de Frete Grátis Itaclean:
              </h3>
              <p className="text-xs text-slate-700 mt-0.5">
                Frete Grátis automático para pedidos acima de <strong>R$ 299,00</strong> nas regiões atendidas pela frota própria ou transportadora parceira.
              </p>
            </div>
          </div>

          <section className="space-y-2">
            <h2 className="text-base font-bold text-slate-900">Modalidades de Envio:</h2>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>
                <strong>Frota Própria Itaclean (Entrega Expressa):</strong> Atendimento em 1 a 2 dias úteis para cidades da região metropolitana.
              </li>
              <li>
                <strong>Transportadoras Homologadas:</strong> Especializadas no transporte seguro de cargas químicas pesadas e bombonas industriais com seguro de carga integral.
              </li>
              <li>
                <strong>Retirada no Centro de Distribuição (Sem custo):</strong> Seu pedido fica separado em nosso balcão logístico em até 4 horas úteis após confirmação do pagamento.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};
