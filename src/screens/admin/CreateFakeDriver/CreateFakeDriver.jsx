import { useState } from 'react';
import { UserPlus, AlertCircle, CheckCircle2, Shield, Info, User, Phone, FileText, Lock, FlaskConical, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ActionButton } from '@/components/ui/ActionButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useCreateFakeDriverMutation, useGetStagingPasswordStatusQuery } from '@/services/api';
import { colors } from "@/constants/colors";
import { IS_HOMOLOGATION_OR_DEV } from '@/constants/const';
import LoadingState from '@/components/LoadingState';

const maskCPF = (value) => {
  if (!value) return '';
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const maskPhone = (value) => {
  if (!value) return '';
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
};

export default function CreateFakeDriver() {
  const { data: statusData, isLoading: isLoadingStatus } = useGetStagingPasswordStatusQuery();
  const [createFakeDriver, { isLoading }] = useCreateFakeDriverMutation();

  if (isLoadingStatus) {
    return <LoadingState text="Carregando..." />;
  }

  const [cpf, setCpf] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [cnh, setCnh] = useState('');
  const [cnhCategory, setCnhCategory] = useState('E');

  const [createdDriver, setCreatedDriver] = useState(null);

  const cleanDigits = (val) => (val ? val.replace(/\D/g, '') : '');

  const rawCpf = cleanDigits(cpf);
  const isCpfValidLength = rawCpf.length === 11;
  const isFormValid = isCpfValidLength && name.trim().length >= 3;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    try {
      const payload = {
        tax_id: rawCpf,
        name: name.trim(),
        phone: phone.trim() || undefined,
        driver_license: cnh.trim() || undefined,
        driver_license_category: cnhCategory.trim() || 'E',
      };

      const result = await createFakeDriver(payload).unwrap();
      const driverData = result?.data;

      setCreatedDriver(driverData);
      toast.success(`Motorista ${driverData.name} criado com sucesso!`);

      // Reset form
      setCpf('');
      setName('');
      setPhone('');
      setCnh('');
      setCnhCategory('E');
    } catch (err) {
      const msg = err?.data?.detail?.message ?? 'Erro ao criar motorista fake.';
      toast.error(msg);
    }
  };

  const hasStagingPassword = statusData?.has_password;

  if (!IS_HOMOLOGATION_OR_DEV) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center gap-3 p-4 border border-amber-200 dark:border-amber-900/50 rounded-xl bg-amber-50 dark:bg-amber-950/30">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Recurso indisponível neste ambiente
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
              A criação de motoristas fake é restrita aos ambientes de desenvolvimento e homologação.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg" style={{ backgroundColor: colors.primary + '1A' }}>
          <UserPlus className="w-5 h-5" style={{ color: colors.primary }} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Criar Motorista (Fake)</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Cadastre motoristas fictícios para testes em ambiente de homologação pulando verificações estritas
          </p>
        </div>
      </div>

      {/* Aviso caso não possua Senha Mestra de Homologação */}
      {statusData && !hasStagingPassword && (
        <div className="p-4 border border-amber-200 dark:border-amber-900/50 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-start gap-3">
          <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
              Atenção: Senha Mestra de Homologação necessária
            </p>
            <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
              Antes de criar um motorista fake, é necessário gerar a <strong>Senha Mestra de Homologação</strong> da empresa. Os motoristas criados utilizarão essa senha para realizar o login no app mobile.
            </p>
            <Link
              to="/staging-password"
              className="inline-flex items-center gap-1.5 mt-2.5 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:underline"
            >
              Ir para Senha de Homologação <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Card de Motorista Criado Recentemente */}
      {createdDriver && (
        <div className="p-5 border border-green-200 dark:border-green-900/50 rounded-2xl bg-green-50/50 dark:bg-green-950/20 space-y-3">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-900 dark:text-green-200">
                Motorista Cadastrado com Sucesso!
              </p>
              <p className="text-xs text-green-700 dark:text-green-400 mt-0.5">
                Os registros foram criados nas tabelas de usuários e motoristas.
              </p>
            </div>
            <button
              onClick={() => setCreatedDriver(null)}
              className="text-xs text-green-700 dark:text-green-400 hover:underline"
            >
              Fechar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white dark:bg-[#111] border border-green-200 dark:border-green-900/40 rounded-xl text-xs">
            <div>
              <span className="text-gray-500 dark:text-gray-400 block">Nome</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{createdDriver.name}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 block">CPF</span>
              <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">{maskCPF(createdDriver.tax_id)}</span>
            </div>
            <div>
              <span className="text-gray-500 dark:text-gray-400 block">CNH</span>
              <span className="font-mono font-semibold text-gray-900 dark:text-gray-100">{createdDriver.driver_license_number || '-'}</span>
            </div>
          </div>

          <p className="text-xs text-green-800 dark:text-green-300 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 flex-shrink-0" />
            Senha de acesso ao app: <strong>Senha Mestra de Homologação da empresa</strong>.
          </p>
        </div>
      )}

      {/* Formulário Principal */}
      <Card className="border-gray-200 dark:border-[#262626] shadow-none overflow-hidden rounded-2xl">
        <CardHeader className="border-b border-gray-100 dark:border-[#262626] bg-gray-50/50 dark:bg-transparent pb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 dark:bg-[#1A1A1A] border border-gray-200 dark:border-[#262626] rounded-lg">
              <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Formulário de Cadastro Simplificado
              </CardTitle>
              <CardDescription className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Em modo homologação, o CPF exige apenas 11 dígitos numéricos sem cálculo de dígito verificador.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Campos Principais em Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Campo CPF */}
              <div className="space-y-1.5">
                <label htmlFor="fake-driver-cpf" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  CPF do Motorista <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="fake-driver-cpf"
                    type="text"
                    value={cpf}
                    onChange={(e) => setCpf(maskCPF(e.target.value))}
                    placeholder="000.000.000-00"
                    maxLength={14}
                    required
                    className="font-mono"
                  />
                </div>
                {cpf && !isCpfValidLength && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Insira exatamente 11 dígitos ({rawCpf.length}/11)
                  </p>
                )}
              </div>

              {/* Campo Nome */}
              <div className="space-y-1.5">
                <label htmlFor="fake-driver-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nome Completo <span className="text-red-500">*</span>
                </label>
                <Input
                  id="fake-driver-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Motorista Teste Homologação"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Celular (Opcional) */}
              <div className="space-y-1.5 sm:col-span-1">
                <label htmlFor="fake-driver-phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Celular <span className="text-xs text-gray-400">(opcional)</span>
                </label>
                <Input
                  id="fake-driver-phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(maskPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                  className="font-mono"
                />
              </div>

              {/* CNH (Opcional) */}
              <div className="space-y-1.5 sm:col-span-1">
                <label htmlFor="fake-driver-cnh" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Número CNH <span className="text-xs text-gray-400">(opcional)</span>
                </label>
                <Input
                  id="fake-driver-cnh"
                  type="text"
                  value={cnh}
                  onChange={(e) => setCnh(e.target.value.replace(/\D/g, '').slice(0, 11))}
                  placeholder="00000000000"
                  maxLength={11}
                  className="font-mono"
                />
              </div>

              {/* Categoria CNH (Opcional) */}
              <div className="space-y-1.5 sm:col-span-1">
                <label htmlFor="fake-driver-cnh-cat" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Categoria CNH
                </label>
                <select
                  id="fake-driver-cnh-cat"
                  value={cnhCategory}
                  onChange={(e) => setCnhCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-[#141414] border border-gray-200 dark:border-[#262626] rounded-xl text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 cursor-pointer"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                  <option value="E">E</option>
                  <option value="AB">AB</option>
                  <option value="AC">AC</option>
                  <option value="AD">AD</option>
                  <option value="AE">AE</option>
                </select>
              </div>
            </div>

            {/* Início das informações explicativas */}
            <div className="p-4 border border-gray-200 dark:border-none rounded-xl bg-gray-50 dark:bg-gray-900/60 flex items-start gap-3">
              <Info className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                <p>
                  <strong>Sem Verificação Estrita:</strong> A validação de celular via SMS/OTP e a verificação de regularidade da CNH são ignoradas.
                </p>
                <p>
                  <strong>Tabelas afetadas:</strong> O motorista é cadastrado simultaneamente na tabela <code className="font-mono text-gray-800 dark:text-gray-200">users</code> (conta do app) e na tabela <code className="font-mono text-gray-800 dark:text-gray-200">drivers</code>.
                </p>
              </div>
            </div>

            {/* Botão de submissão */}
            <div className="pt-2">
              <ActionButton
                type="submit"
                id="create-fake-driver-btn"
                loading={isLoading}
                disabled={!isFormValid || !hasStagingPassword}
                variant="primary"
                className="w-full sm:w-auto"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Criar Motorista (Fake)
              </ActionButton>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
