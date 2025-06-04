import React from 'react';

export default function MinimalApp() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Auto Transport Quote Calculator</h1>
      <div style={{ 
        border: '1px solid #ccc', 
        padding: '20px', 
        borderRadius: '8px',
        maxWidth: '600px',
        margin: '0 auto'
      }}>
        <form>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Vehicle Type:</label>
            <select style={{ width: '100%', padding: '8px' }}>
              <option value="">Select vehicle type</option>
              <option value="car/truck/suv">Car/Truck/SUV</option>
              <option value="motorcycle">Motorcycle</option>
              <option value="rv">RV</option>
              <option value="boat">Boat</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Pickup Location:</label>
            <input 
              type="text" 
              placeholder="Enter pickup city, state"
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Delivery Location:</label>
            <input 
              type="text" 
              placeholder="Enter delivery city, state"
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Vehicle Year:</label>
            <select style={{ width: '100%', padding: '8px' }}>
              <option value="">Select year</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
              <option value="2021">2021</option>
              <option value="2020">2020</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Vehicle Make:</label>
            <select style={{ width: '100%', padding: '8px' }}>
              <option value="">Select make</option>
              <option value="toyota">Toyota</option>
              <option value="honda">Honda</option>
              <option value="ford">Ford</option>
              <option value="chevrolet">Chevrolet</option>
              <option value="bmw">BMW</option>
            </select>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Vehicle Model:</label>
            <input 
              type="text" 
              placeholder="Enter vehicle model"
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Name:</label>
            <input 
              type="text" 
              placeholder="Your name"
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Phone:</label>
            <input 
              type="tel" 
              placeholder="Your phone number"
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
            <input 
              type="email" 
              placeholder="Your email address"
              style={{ width: '100%', padding: '8px' }}
            />
          </div>
          
          <button 
            type="submit"
            style={{ 
              backgroundColor: '#007bff', 
              color: 'white', 
              padding: '12px 24px', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              width: '100%'
            }}
          >
            Get Quote
          </button>
        </form>
      </div>
    </div>
  );
}