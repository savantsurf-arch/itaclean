import React from 'react';
import { ShieldCheck, Lock, FileText } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-2xs space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="border-b border-slate-100 pb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#003893] bg-blue-50 px-2.5 py-1 rounded">
              LGPD (Lei nº 13.709/2018)
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
              Política de Privacidade e Proteção de Dados
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Última atualização: Outubro de 2026 • Itaclean Pro Distribuidora Ltda
            </p>
          </div>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">1. Coleta e Finalidade dos Dados</h2>
            <p>
              A <strong>Itaclean Limpeza e Descartável</strong> coleta apenas os dados estritamente necessários para
              a operação comercial, emissão de Notas Fiscais Eletrônicas (NF-e) e logística de entrega dos pedidos:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nome completo ou Razão Social;</li>
              <li>CPF ou CNPJ e Inscrição Estadual (quando aplicável);</li>
              <li>Endereço completo para entrega física das mercadorias;</li>
              <li>E-mail e telefone para envio de comprovantes, XML de nota fiscal e rastreamento;</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">2. Segurança nos Pagamentos</h2>
            <p>
              Não armazenamos dados sensíveis de cartão de crédito em nossos servidores ou banco de dados.
              Todas as transações financeiras são processadas por meio de gateways de pagamento seguros
              com certificação PCI-DSS internacional.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">3. Direitos do Titular (LGPD)</h2>
            <p>
              Em conformidade com o Artigo 18 da LGPD, você tem o direito de solicitar a qualquer momento:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Confirmação da existência de tratamento dos seus dados;</li>
              <li>Acesso aos dados coletados;</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados;</li>
              <li>Eliminação de dados pessoais não obrigatórios para fins de auditoria fiscal;</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">4. Contato do Encarregado de Dados (DPO)</h2>
            <p>
              Para exercer seus direitos ou tirar dúvidas sobre privacidade, envie uma mensagem para o nosso
              canal de proteção de dados:{' '}
              <a href="mailto:privacidade@itaclean.com.br" className="text-[#003893] font-bold underline">
                privacidade@itaclean.com.br
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
