import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';

// Opciones de paquetes disponibles
const packageOptions = [
  { value: "no-necesita", label: "No necesita", price: 30},
  { value: "p1-individual", label: "Paquete 1 - Pack individual", price: 105 },
  { value: "p1-doble", label: "Paquete 1 - Pack doble", price: 140 },
  { value: "p1-doble-acompanante", label: "Paquete 1 - Pack doble con acompañante", price: 110 },
  { value: "p2-individual", label: "Paquete 2 - Pack individual", price: 175 },
  { value: "p2-doble", label: "Paquete 2 - Pack doble", price: 210 },
  { value: "p2-doble-acompanante", label: "Paquete 2 - Pack doble con acompañante", price: 180 },
];

// Tipos para el formulario
type FormValues = {
  name: string;
  phone: string;
  bcpUser: string;
  packageType: string;
};

const RegistrationForm: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean;
    message?: string | React.ReactNode;
  }>({});
  const formRef = useRef<HTMLFormElement>(null);

  const handleSuccessfulSubmission = (data: FormValues, selectedPackage: any) => {
    setSubmitStatus({
      success: true,
      message: "¡Inscripción recibida correctamente! Te contactaremos pronto."
    });
    
    // Guardar en localStorage
    try {
      const submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
      submissions.push({
        name: data.name,
        phone: data.phone,
        bcpUser: data.bcpUser,
        packageType: selectedPackage?.label || "",
        packagePrice: selectedPackage?.price || 0,
        date: new Date().toISOString(),
      });
      localStorage.setItem('formSubmissions', JSON.stringify(submissions));
    } catch (e) {
      console.error("Error guardando datos localmente:", e);
    }
    
    // Resetear el formulario
    reset();
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Encontrar el paquete seleccionado para obtener el precio y nombre
      const selectedPackage = packageOptions.find(pkg => pkg.value === data.packageType);
      
      // 1. Verificar si ya existe un registro local con los mismos datos
      try {
        const submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
        const duplicateSubmission = submissions.find(
          sub => sub.phone === data.phone || sub.bcpUser === data.bcpUser
        );
        
        if (duplicateSubmission) {
          const reason = duplicateSubmission.phone === data.phone 
            ? 'teléfono' 
            : 'usuario BCP';
            
          setSubmitStatus({
            success: false,
            message: `Ya existe una inscripción con este ${reason}. Si necesitas modificar tu registro, por favor contáctanos.`
          });
          return;
        }
      } catch (e) {
        console.error("Error verificando registros locales:", e);
        // Continuar con el proceso incluso si hay un error aquí
      }
      
      // 2. ENVIAR A FORMSUBMIT.CO PARA RECIBIR EMAIL
      const formSubmitUrl = "https://formsubmit.co/ajax/info@gtceuta.com";
      
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('phone', data.phone);
      formData.append('bcpUser', data.bcpUser);
      formData.append('packageType', selectedPackage?.label || "");
      formData.append('packagePrice', selectedPackage?.price?.toString() || "0");
      
      formData.append('_captcha', 'false');
      formData.append('_template', 'table');
      formData.append('_subject', 'Nueva inscripción GT CEUTA');
      
      // Enviar a FormSubmit usando el endpoint correcto de AJAX
      const emailResponse = await fetch(formSubmitUrl, {
        method: 'POST',
        body: formData
      });
      
      // Verificar si el envío del email fue exitoso
      if (!emailResponse.ok) {
        throw new Error('Error al enviar el formulario a FormSubmit');
      }
      
      // 3. ENVIAR A GOOGLE SHEETS - Pero ahora no mostraremos éxito hasta obtener respuesta
      const googleScriptURL = "https://script.google.com/macros/s/AKfycbyHGodDDSyUI310wfK9cby8CvoPQte6BX5wKvnBY3-_13usQvmMtyz4Tb_XYBiUWlCg/exec";
      
      // Construir los parámetros como URL
      const params = new URLSearchParams();
      params.append('name', data.name);
      params.append('phone', data.phone);
      params.append('bcpUser', data.bcpUser);
      params.append('packageType', selectedPackage?.label || "");
      params.append('packagePrice', selectedPackage?.price?.toString() || "0");

      // JSONP para evitar limitaciones CORS
      const scriptId = `googleScript_${Date.now()}`;
      const callbackName = `googleCallback_${Date.now()}`;

      // Crear una promesa que se resolverá cuando obtengamos respuesta
      const googleSheetsResponse = new Promise((resolve) => {
        // Definir la función de callback
        window[callbackName] = (response) => {
          console.log("Google Apps Script response:", response);
          resolve(response);
          
          // Limpiar el elemento script
          const scriptElement = document.getElementById(scriptId);
          if (scriptElement) document.body.removeChild(scriptElement);
          delete window[callbackName];
        };
        
        // Crear el elemento script para JSONP
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = `${googleScriptURL}?${params.toString()}&callback=${callbackName}`;
        document.body.appendChild(script);
        
        // Timeout para resolver la promesa después de 5 segundos si no hay respuesta
        setTimeout(() => {
          if (window[callbackName]) {
            console.log("Timeout esperando respuesta del servidor");
            resolve({ result: 'timeout', message: 'No se recibió respuesta del servidor' });
            
            // Limpiar
            const scriptElement = document.getElementById(scriptId);
            if (scriptElement) document.body.removeChild(scriptElement);
            delete window[callbackName];
          }
        }, 5000);
      });
      
      // Esperar la respuesta del script de Google
      const response = await googleSheetsResponse as any;
      
      // Ahora manejamos los distintos casos según la respuesta
      if (response && response.result === 'duplicate') {
        // Caso de duplicado
        setSubmitStatus({
          success: false,
          message: `Ya existe una inscripción con este ${response.reason || 'identificador'}. Si necesitas modificar tu registro, por favor contáctanos.`
        });
      } 
      else if (response && response.result === 'success') {
        // Caso de éxito
        handleSuccessfulSubmission(data, selectedPackage);
      }
      else if (response && response.result === 'timeout') {
        // En caso de timeout, asumimos éxito ya que los datos se guardaron
        // Verificación local para detectar duplicados
        try {
          const submissions = JSON.parse(localStorage.getItem('formSubmissions') || '[]');
          const isDuplicate = submissions.some(
            sub => sub.phone === data.phone || sub.bcpUser === data.bcpUser
          );
          
          if (!isDuplicate) {
            // Si no es un duplicado local, asumimos éxito
            handleSuccessfulSubmission(data, selectedPackage);
          } else {
            // Si ya tenemos un registro local, probablemente es un envío repetido
            setSubmitStatus({
              success: false,
              message: "Parece que ya habías enviado una inscripción anteriormente. Si necesitas modificarla, por favor contáctanos."
            });
          }
        } catch (e) {
          // Si hay error al verificar duplicados, asumimos éxito
          handleSuccessfulSubmission(data, selectedPackage);
        }
      }
      else {
        // Otros casos (error, etc.)
        setSubmitStatus({
          success: false,
          message: response?.message || "Hubo un problema al procesar tu inscripción. Por favor, inténtalo de nuevo."
        });
      }
      
    } catch (error) {
      console.error("Error:", error);
      setSubmitStatus({
        success: false,
        message: "Hubo un error al procesar tu inscripción. Por favor, inténtalo de nuevo."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Función para cerrar el mensaje de estado
  const clearStatus = () => {
    setSubmitStatus({});
  };

  return (
    <div className="bg-gray-800 rounded-lg p-8 max-w-md mx-auto">
      <h3 className="text-2xl font-bold mb-6 text-center text-red-600">Formulario de inscripción</h3>
      
      {submitStatus.message && (
        <div className={`p-4 mb-6 rounded-md ${submitStatus.success ? 'bg-green-800' : 'bg-red-800'}`}>
          <div className="flex items-center justify-between">
            <p className="text-white">{submitStatus.message}</p>
            <button 
              onClick={clearStatus}
              className="text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label className="block text-gray-300 mb-2" htmlFor="name">Nombre completo</label>
          <input
            id="name"
            type="text"
            className="w-full p-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="Tu nombre y apellidos"
            {...register("name", { required: "El nombre es obligatorio" })}
          />
          {errors.name && <p className="mt-1 text-red-500">{errors.name.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 mb-2" htmlFor="phone">Número de teléfono</label>
          <input
            id="phone"
            type="tel"
            className="w-full p-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="Tu número de teléfono"
            {...register("phone", { 
              required: "El teléfono es obligatorio",
              pattern: {
                value: /^[0-9]{9}$/,
                message: "Introduce un número de teléfono válido (9 dígitos)"
              }
            })}
          />
          {errors.phone && <p className="mt-1 text-red-500">{errors.phone.message}</p>}
        </div>

        <div className="mb-4">
          <label className="block text-gray-300 mb-2" htmlFor="bcpUser">Usuario/Email BCP</label>
          <input
            id="bcpUser"
            type="text"
            className="w-full p-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="Tu usuario o email en BCP"
            {...register("bcpUser", { required: "El usuario/email de BCP es obligatorio" })}
          />
          {errors.bcpUser && <p className="mt-1 text-red-500">{errors.bcpUser.message}</p>}
        </div>

        <div className="mb-6">
          <label className="block text-gray-300 mb-2" htmlFor="packageType">Pack de viaje</label>
          <select
            id="packageType"
            className="w-full p-3 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
            {...register("packageType", { required: "Selecciona una opción" })}
          >
            <option value="">Selecciona un pack</option>
            {packageOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label} {option.price > 0 ? `(${option.price}€)` : ""}
              </option>
            ))}
          </select>
          {errors.packageType && <p className="mt-1 text-red-500">{errors.packageType.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full p-3 rounded-md font-bold ${
            isSubmitting 
              ? 'bg-gray-500 cursor-not-allowed' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar inscripción'}
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;